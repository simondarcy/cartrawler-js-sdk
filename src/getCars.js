import {testBaseURL, prodBaseURL, carSizes, currencySymbols} from './globals.js';
import { getIP } from './getIP.js';
//Wrapper for OTA_VehAvailRate
export async function getCars(obj) {

    //Validate required fields
    if(!obj.hasOwnProperty('clientID')){
        return {'error':'Please pass a valid clientID'}
    }
    if(!obj.hasOwnProperty('pickupdate')){
        return {'error':'pickupdate required'}
    }
    if(!obj.hasOwnProperty('dropoffdate')){
        return {'error':'dropoffdate required'}
    }
    if(!obj.hasOwnProperty('pickuplocation')){
        return {'error':'pickuplocation required'}
    }
    if(!obj.hasOwnProperty('dropofflocation')){
        obj.dropofflocation =  obj.pickuplocation;
    }
    if(typeof obj.dropofflocation !== "string"){
        return {'error':'dropofflocation must be a string'}
    }
    //end required fields validation
    
    let debug = (obj.hasOwnProperty('debug') && obj.debug);

    if(debug){
        console.log('%c CT SDK in debug mode', 'font-weight: bold; font-size: 22px;color: blue; text-shadow: 3px 3px 0 rgb(217,31,38) ,  6px 6px 0 rgb(5,148,68)');
    }

    let imageWidth = 180; //default width of images
    if(obj.hasOwnProperty('imageWidth') && typeof obj.imageWidth === "number"){
        imageWidth = obj.imageWidth;
    }


    //default deeplink
    let deeplinkURL = "https://partner-whitelabel.cartrawler.com/";
    //allow partner to overide base url
    if(obj.hasOwnProperty('deeplink')){
        deeplinkURL = obj.deeplink;
        //If there is no slash add it
        if(!deeplinkURL.endsWith('/')) deeplinkURL = deeplinkURL+'/';
    }

    //Base URL
    let url = `${(debug)?testBaseURL:prodBaseURL}?type=OTA_VehAvailRateRQ`

    //request with required params
    let data = {
        "@xmlns": "http://www.opentravel.org/OTA/2003/05",
        "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "@Target": `${(debug)?"Test":"Production"}`, //test or production must match base URL
        "@Version": "1.005",
        "@MaxResponses": 200,
        "POS": {
            "Source": {
                "@ISOCurrency": "EUR",
                "RequestorID": {
                    "@Type": "16",
                    "@ID": obj.clientID,
                    "@ID_Context": "CARTRAWLER"
                }
            }
        },
        "VehAvailRQCore": {
            "@Status": "Available",
            "VehRentalCore": {
                "@PickUpDateTime": obj.pickupdate,
                "@ReturnDateTime": obj.dropoffdate,
                "PickUpLocation": {
                    "@CodeContext": "IATA",
                    "@LocationCode": obj.pickuplocation
                },
                "ReturnLocation": {
                    "@CodeContext": "IATA",
                    "@LocationCode": obj.dropofflocation
                }
            },
            "DriverType": {
                "@Age": "30"
            }
        },
        "VehAvailRQInfo": {
            "@PassengerQty": "1",
            "Customer": {
                "Primary": {
                    "CitizenCountryName": {
                        "@Code": "US"
                    }
                }
            },
            "TPA_Extensions": {
                "ConsumerIP": "127.0.0.123"
            }
        }
    }; //end data

    //Override optional parms

    //Currency
    if (obj.hasOwnProperty("currency")){
        data.POS.Source['@ISOCurrency'] = obj.currency;
    }
    //Age
    if (obj.hasOwnProperty("age") && !isNaN(parseInt(obj.age))){
        data.VehAvailRQCore.DriverType['@Age'] = obj.age.toString();
    }
    //Passengers
    if (obj.hasOwnProperty("pax") && !isNaN(parseInt(obj.pax))){
        data.VehAvailRQInfo['@PassengerQty'] = obj.pax.toString();
    }
    //Residency
    if (obj.hasOwnProperty("residency") && typeof obj.residency === "string"){
        data.VehAvailRQInfo.Customer.Primary.CitizenCountryName['@Code'] = obj.residency
    }else{
        let ipData = await getIP();
        if(debug){
            console.log("IP Data", ipData);
        }
        data.VehAvailRQInfo.Customer.Primary.CitizenCountryName['@Code'] = ipData.CountryName["@Code"]
    } 

    //number of cars
    if (obj.hasOwnProperty("limit") && !isNaN(parseInt(obj.limit))){
        //data['@MaxResponses'] = obj.limit;
    }
     
    //loyalty
    if (obj.hasOwnProperty("loyalty") && typeof obj.loyalty === "string"){
        data.VehAvailRQInfo.Customer.Primary.CustLoyalty = [{
            "@ProgramID": obj.loyalty.toUpperCase()
        }]
    }

    //Downtown
    if (!isNaN(parseFloat(obj.pickuplocation))){
        data.VehAvailRQCore.VehRentalCore.PickUpLocation = {
                "@CodeContext": "GEO",
                "#text": obj.pickuplocation,
        }
    }

    if (!isNaN(parseFloat(obj.dropofflocation))){
        data.VehAvailRQCore.VehRentalCore.ReturnLocation = {
                "@CodeContext": "GEO",
                "#text": obj.dropofflocation,
        }
    }

    try {
        // Using fetch to get the response
        let response = await fetch(url, {
            method:'POST',
            headers:{},
            body:JSON.stringify(data)
        });//end fetch 

        let responseData = await response.json();
        if(debug) console.log(responseData);

        if(responseData.hasOwnProperty('Errors') ){
            return {'error': `Error retreiving data from CarTrawler. Please try another search. Full Error: ${responseData.Errors.Error['@ShortText']}`}
        }
        //Create deeplink !todo elID ????
        deeplinkURL = `${deeplinkURL}book?ln=${responseData['@PrimaryLangID'].toLowerCase()}&pickupDateTime=${responseData.VehAvailRSCore.VehRentalCore['@PickUpDateTime']}&returnDateTime=${responseData.VehAvailRSCore.VehRentalCore['@ReturnDateTime']}&age=${data.VehAvailRQCore.DriverType['@Age']}&clientID=${obj.clientID}&ct=MP&residenceID=${data.VehAvailRQInfo.Customer.Primary.CitizenCountryName['@Code']}&curr=${data.POS.Source["@ISOCurrency"]}&pickupID=${responseData.VehAvailRSCore.VehRentalCore.PickUpLocation['@LocationCode']}&&returnID=${responseData.VehAvailRSCore.VehRentalCore.ReturnLocation['@LocationCode']}`

        let cars = [];
        let suppliers = responseData.VehAvailRSCore.VehVendorAvails;
        //OTA quirk where a single supplier comes back as obj not Array. In this instance, convert to single item array
        if ( !Array.isArray(suppliers) ){
            suppliers = [suppliers.VehVendorAvail];
        } 
        //Loop through each supplier (OTA groups cars by supplier)
        suppliers.forEach(function(supplier, idx) {
            //For testing log first supplier
            if(debug && idx==0){
                console.log("sample supplier", supplier);
            }
            //Loop through each car in said supplier
            supplier.VehAvails.forEach(function(car, idx) {

                //For testing log first car 
                if(debug && idx==0){
                    console.log("sample car", car);
                }

                //Create a simplified, flat car object 
                let carObj = {
                    "name":car.VehAvailCore.Vehicle.VehMakeModel['@Name'],
                    "price":{
                        "sale":false,
                        "total":car.VehAvailCore.TotalCharge['@RateTotalAmount'],
                        "currency":car.VehAvailCore.TotalCharge['@CurrencyCode'],
                        "symbol":( currencySymbols[car.VehAvailCore.TotalCharge['@CurrencyCode']]!==undefined ) ? currencySymbols[car.VehAvailCore.TotalCharge['@CurrencyCode']] : car.VehAvailCore.TotalCharge['@CurrencyCode'],
                        "day":(parseFloat(car.VehAvailCore.TotalCharge['@RateTotalAmount']) / parseInt(car.VehAvailCore.TPA_Extensions.Config['@Duration'])).toFixed(2),
                        "pre_paid_deposit":car.VehAvailCore.TPA_Extensions.PPDep['@Available']
                    },
                    "fuel_policy":car.VehAvailCore.TPA_Extensions.FuelPolicy["@Type"],
                    "cc_required":car.VehAvailCore.TPA_Extensions.CC_Info['@Required'],
                    "debit_card_accepted":car.VehAvailCore.TPA_Extensions.DebitCard['@OnArrival'],
                    "image":`${car.VehAvailCore.Vehicle.PictureURL}?w=${imageWidth}`,
                    "transmission":car.VehAvailCore.Vehicle['@TransmissionType'],
                    "size":(carSizes.hasOwnProperty(car.VehAvailCore.Vehicle.VehClass['@Size']))?carSizes[car.VehAvailCore.Vehicle.VehClass['@Size']]:"unknown",
                    "fuel":car.VehAvailCore.Vehicle['@FuelType'].toLowerCase(),
                    "doors":car.VehAvailCore.Vehicle.VehType['@DoorCount'],
                    "seats":car.VehAvailCore.Vehicle['@PassengerQuantity'],
                    "bags":car.VehAvailCore.Vehicle['@BaggageQuantity'],
                    "sipp":car.VehAvailCore.Vehicle['@Code'],
                    "airconditioned":car.VehAvailCore.Vehicle['@AirConditionInd'],
                    "supplier":{
                        "name":supplier.Vendor['@CompanyShortName'],
                        "image":`https://ct-supplierimage.imgix.net/car/${supplier.Vendor['@CompanyShortName'].toLowerCase().replace(' ', '')}.pdf?output=auto&w=60&q=80&dpr=2`,
                        "terminal":(supplier.Info.LocationDetails['@AtAirport'] == "0"),
                        "location":supplier.Info.LocationDetails.Address['@Remark'],
                        "rating":(supplier.Info.TPA_Extensions.hasOwnProperty('CustomerReviews'))?parseFloat(supplier.Info.TPA_Extensions.CustomerReviews['@overall']):0.0
                    },
                    "extras":car.VehAvailCore.PricedEquips.map(extra => ({'name':extra.Equipment.Description, 'price':extra.Charge['@Amount'], 'included':extra.Charge['@IncludedInRate']}) ),
                    "features":{
                        "price_freeze_available":car.VehAvailCore.TPA_Extensions.PriceFreeze['@Available']
                    },
                    "offers":[],
                    "deeplink":`${deeplinkURL}&refID=${car.VehAvailCore.Reference['@ID']}#/vehicles`,
                    "order":parseInt(car.VehAvailCore.TPA_Extensions.Config['@Relevance']),
                    "insruance_widget":"https://ct-demos.com/insurablock/widget.php?clientid=122070&residency=us&currency=usd&country=de&amount=100.20&language=en&startdate=2024-09-26T10:00:00&enddate=2024-09-29T10:00:00",
                    "reference":car.VehAvailCore.Reference
                }


                //Add offers (shuld we only do this on cars being returned as opposed to all)
                if(car.VehAvailCore.TPA_Extensions.hasOwnProperty('SpecialOffers')){
                    let offers = car.VehAvailCore.TPA_Extensions.SpecialOffers;
                    let cleanOffers = []
                    //OTA quirk where a single offer comes back as obj not Array. In this instance, convert to single item array
                    if ( !Array.isArray(offers) ){
                        offers = [offers.Offer];
                    }
                    //sort offers  by 
                    
                    if(offers.length>1){
                        offers.sort((a,b) => parseInt(a['@Index']) - parseInt(b['@Index']));
                    }

                    //looop thoguh offers and clean them
                    offers.forEach(function(offer, idx) {
                            if(offer['@UIToken'] === "monetary_discount" || offer['@UIToken'] === "percentage_discount"){
                                if(offer['@UIToken'] === "monetary_discount"){
                                    carObj.price.sale = true;
                                    carObj.price.strikeThroughAmount = offer['@Amount']
                                    carObj.price.discountAmount = offer['@Discount']
                                }
                                else{
                                    carObj.price.percentageDiscount = offer['@Value']
                                }

                        }
                        else{
                            cleanOffers.push({
                                'name':offer['@UIToken'],
                                'text':offer['@ShortText'],
                                'description':offer['#text']
                            })
                        }
                        
                       
                    });
                    carObj.offers = cleanOffers
                }

                //If loyalty enabled return points amount
                if (car.VehAvailCore.TPA_Extensions.hasOwnProperty('Loyalty')){
                    carObj.loyaltypoints = car.VehAvailCore.TPA_Extensions.Loyalty['@PointsEarnedPartner']
                }
                //Deposit info
                if(car.VehAvailCore.TPA_Extensions.hasOwnProperty('Deposit')){
                    carObj.price.deposit = car.VehAvailCore.TPA_Extensions.Deposit['@Amount'];
                }

                //return the API call needed to book this car
                if (obj.hasOwnProperty('book')){
                    carObj.bookReference = {
                        "@Target": responseData['@Target'],
                        "@PrimaryLangID": responseData['@PrimaryLangID'],
                        "POS": {
                            "Source": [{
                                "@ERSP_UserID": "MP",
                                "@ISOCurrency": data.POS.Source['@ISOCurrency'],
                                "RequestorID": {
                                    "@Type": "16",
                                    "@ID": obj.clientID,
                                    "@ID_Context": "CARTRAWLER"
                                },
                                "@AirportCode": "DUB"
                            }]
                        },
                        "@xmlns": "http://www.opentravel.org/OTA/2003/05",
                        "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
                        "@Version": "3.000",
                        "VehResRQCore": {
                            "@Status": "All",
                            "VehRentalCore": responseData.VehAvailRSCore.VehRentalCore,
                            "Customer": {
                                "Primary": {
                                    "PersonName": {
                                        "GivenName": "[FIRSTNAME]",
                                        "Surname": "[SURNAME]"
                                    },
                                    "Telephone": [{
                                        "@PhoneTechType": "1",
                                        "@PhoneNumber": "[TELEPHONE]"
                                    }],
                                    "Email": {
                                        "@EmailType": "2",
                                        "#text": "[EMAIL]"
                                    },
                                    "Address": {
                                        "@Type": "2",
                                        "CountryName": {
                                            "@Code": "IE"
                                        }
                                    },
                                    "CitizenCountryName": {
                                        "@Code": "IE"
                                    }
                                }
                            },
                            "DriverType": {
                                "@Age": 30
                            }
                        },
                        "VehResRQInfo": {
                            "RentalPaymentPref": {
                                "PaymentCard": {
                                    "@CardCode": "[CARDCODE]",
                                    "@ExpireDate": "[EXPIREDATE]",
                                    "CardHolderName": "[CARDHOLDERNAME]",
                                    "CardNumber": {
                                        "PlainText": "[CARDNUMBER]"
                                    },
                                    "SeriesCode": {
                                        "PlainText": "[SERIESCODE]"
                                    }
                                }
                            },
                            "Reference": carObj.reference,
                            "TPA_Extensions": {}
                        }
                    }//End booking reference 
                }

                //!todo add insurance widget
                //!todo add tax breakdown
                //!todo add strikthough info and sale flag
            
                cars.push(carObj);
            });

        });//end supplier loop

        
        // SORT
        // price|rating|points
        switch(obj.sort) {
            case "price":
                cars.sort((a,b) => a.price.total - b.price.total);
                break;
            case "rating":
                cars.sort((a,b) => a.supplier.rating - b.supplier.rating);
                break;
            case "miles":
            case "points":
            case "loyalty":
                cars.sort((a,b) => a.loyaltypoints - b.loyaltypoints);
                break;
            default:
                //apply default sort which is CT recommended order
                cars.sort((a,b) => a.order - b.order);
        }

        // FILTERS

        // Suppliers filter
        if(obj.hasOwnProperty("suppliers") &&  Array.isArray(obj.suppliers)){
            cars = cars.filter(function(car){
                return obj.suppliers.indexOf(car.supplier.name.toLowerCase()) > -1;
            });
        }

        // Car Size filter
        if(obj.hasOwnProperty("sizes") && Array.isArray(obj.sizes)){
            cars = cars.filter(function(car){
                return obj.sizes.indexOf(car.size.toLowerCase()) > -1;
            });
        }

        // Unique car filter
        if(obj.hasOwnProperty("unique")){
            cars = cars.filter((value, index, self) => {
                return self.findIndex(car => car.sipp === value.sipp) === index;
            });
        }

        // LIMIT !todo is this is needed if MAX responses is added to request
        if (obj.hasOwnProperty("limit") && !isNaN(parseInt(obj.limit))){
            cars = cars.slice(0, parseInt(obj.limit));
        }else{
            //defauly limit of 20
            cars = cars.slice(0, 20);
        }
        
        let res = {
            pickupName:responseData.VehAvailRSCore.VehRentalCore.PickUpLocation['@Name'],
            deeplinkURL:`${deeplinkURL}#/vehicles`,
            cars:cars
        }

        if(debug){
            console.log("SDK response:", res);
        }

        return res;
      } catch (error) {
        console.log(error);
        return {'error':error}
      }

}