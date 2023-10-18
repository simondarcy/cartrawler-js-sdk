# CarTrawler JavaScript SDK

The CarTrawler Javascript SDK is a complete set of APIs that will allow you to easily integrate car rental into your web application. You can see the SDK in action [here](https://codepen.io/sidarcy/full/abPgmNJ).

## Installation 

The SDK can be installed as an NPM package or via our CDN.

### CDN

Include the following in your HTML:

```html
<script src="https://sdk.ct-demos.com/cartrawler.js"></script>
```

### NPM (coming soon)

Install via [npm](https://www.npmjs.com):

```bash
npm install cartrawler
```

## Quickstart
View codepen [here](https://codepen.io/sidarcy/pen/qBQEJbp)
```html

<div id="widget"><!-- Cars will appear here --></div>
  
<!-- Load SDK via CDN -->
<script src="https://sdk.ct-demos.com/cartrawler.js"></script>
<script>
  //Retrieve 3 cars in Dublin airport (DUB) for 3 days in January
  let config ={clientID:122070, 
              pickupdate:"2024-01-15T10:00:00",
              dropoffdate:"2024-01-18T10:00:00",
              pickuplocation:"DUB",
              limit:3
              };
  //Retreive cars using getCars function
  CarTrawler.getCars(config).then((data) => {
      //Loopthrough results
      data.cars.forEach(function(car) {
        //Output car name, price and image
        document.getElementById('widget').innerHTML += `
        <p>
          <a href="${car.deeplink}" target="_blank">
            ${car.name} -  ${car.price.symbol}${car.price.total}
          </a>
        </p>
        <img src="${car.image}"/>`;
      });
  });
</script>

```



## Usage

### getCars()

The main function to retrieve cars

Retrieve 6 cars in Dallas Forth Worth Airport from Feb 15 to June 18

```javascript

      
let config ={clientID:122070, 
              pickupdate:"2024-02-15T10:00:00",
              dropoffdate:"2024-02-18T10:00:00",
              pickuplocation:"DFW",
              limit:6
              };

  CarTrawler.getCars(config).then((data) => {
    
    if (data.hasOwnProperty('error')){
      console.log('error: '+data.error)
    }
    else{
      //Loop through cars returned
      data.cars.forEach(function(car) {
        console.log(car.name);
      });

    }

```


## Config options available

Note: The only required paramters are: *clientID*, *pickupLocation*, *pickupDate* and *dropOffDate*.

| Option          | Required | Type    | Example                     | Description   |
|:--------------- | :------: |:------: |:--------------------------- | :------------ |
| clientID        | Yes      | Int     | 122070                      | Unique partner id provider by CarTrawler        |
| pickupDate      | Yes      | String  | "2024-02-18T10:00:00"       |   Date and time customer wants to pick up their car        |
| dropOffDate     | Yes      | String  | "2024-02-18T10:00:00"       |    Date and time customer wants to return their car       |
| pickupLocation  | Yes      | String  | "DUB"                       |   3 letter airport IATA code or GEO Coordinates  of a location    |
| dropOffLocation | No       | String  | "DUB"                       |    3 letter airport IATA code or GEO Coordinates  of a location.  Defaults to same as pikcup         |
| currency        | No       | String  | eur                         |    Currency the customer is using to book.Defaults to EUR       |
| residency       | No       | String  | IE                          |    Customers country of residency         |
| limit           | No       | Int     | 3                           |   Number of cars to return. Defaults to 6        |
| sizes           | No       | Array   | ['premium', 'compact', 'suv']|    Filter by different car sizes        |
| suppliers       | No       | Array   | ['hertz', 'avis']           |    Filter by certain suppliers         |
| unique          | No       | Boolean | true                        |    Only return unique car types ie 1 compact, 1 suv etc        |
| sort            | No       | String  | "price"                     |    Default to CarTrawler recommended sort order but can be updated to price or loaylty miles earned        |
| age             | No       | Int     | 30                          |    age of lead driver        |
| pax             | No       | Int     | 2                           |    number of passengers        |
| deeplink        | No       | String  | "https://www.mydomain.com/" |    URL of CarTrawler microsite that you may want to direct customer to        |
| book            | No       | Boolean | true                        |    if true, the CarTrawler reservation API request will be added to each car object        |
| imageWidth      | No       | Int     | 300                         |    car image size, defautls to 300px        |
| loyalty         | No       | String  | "airline"                   |    Loaylty program name if loaylty enabled       |
| debug           | No       | Boolean | true                        |    If true, SDK will log useful infomation in the console        |



## Returned Data

Each car object returns the following information
```javascript
{
    "name": "Fiat 500 or similar",
    "price": {
        "sale": false,
        "total": "44.56",
        "currency": "EUR",
        "symbol": "€",
        "day": "14.85",
        "pre_paid_deposit": "false",
        "deposit": "1200.00"
    },
    "fuel_policy": "FULLFULL",
    "cc_required": "true",
    "debit_card_accepted": "false",
    "image": "https://ctimg-fleet.cartrawler.com/fiat/500/primary.png?w=300",
    "transmission": "Manual",
    "size": "Mini",
    "fuel": "unspecified",
    "doors": "3",
    "seats": "4",
    "bags": "1",
    "sipp": "MBMR",
    "airconditioned": "true",
    "supplier": {
        "name": "OK MOBILITY",
        "image": "https://ct-supplierimage.imgix.net/car/okmobility.pdf?output=auto&w=60&q=80&dpr=2",
        "terminal": false,
        "location": "40.4492480,-3.5624190",
        "rating": 3.9
    },
    "extras": [
        {
            "name": "Additional Driver",
            "price": "21.00",
            "included": "false"
        },
        {
            "name": "GPS",
            "price": "21.00",
            "included": "false"
        },
        {
            "name": "Child toddler seat",
            "price": "21.00",
            "included": "false"
        },
        {
            "name": "Booster seat",
            "price": "21.00",
            "included": "false"
        },
        {
            "name": "Infant child seat",
            "price": "21.00",
            "included": "false"
        }
    ],
    "features": {
        "price_freeze_available": "false"
    },
    "offers": [
        {
            "name": "pre_registration",
            "text": "Pre-Registration available",
            "description": "For faster, easier car hire, add driver details before pick-up."
        }
    ],
    "deeplink": "https://partner-whitelabel.cartrawler.com/book?ln=en&pickupDateTime=2023-11-15T10:00:00Z&returnDateTime=2023-11-18T10:00:00Z&age=30&clientID=122070&ct=MP&residenceID=IE&curr=EUR&pickupID=530&&returnID=530&refID=782517946#/vehicles",
    "order": 1,
    "insruance_widget": "https://ct-demos.com/insurablock/widget.php?clientid=122070&residency=us&currency=usd&country=de&amount=100.20&language=en&startdate=2024-09-26T10:00:00&enddate=2024-09-29T10:00:00",
    "reference": {
        "@Type": "16",
        "@ID": "782517946",
        "@ID_Context": "CARTRAWLER",
        "@DateTime": "2023-10-12T22:52:42.521+01:00",
        "@URL": "b80c110d-e5fc-443e-a4d3-f28821d84b95.12"
    }
}

```


## Best In Class Implementation

Using a live CarTrawler widget,the below image details how you can use the varioius fields returned from the SDK to build a best in class car retnal user interface.

<img src="https://sdk.ct-demos.com/docs/example.jpg" width="750"/>

You can see an example CarTrawler widget [here](https://product-router.cartrawler.com/product/widget/airfrance/594782/en?currency=EUR&flight-0-arrival-date-time=2023-10-27T23:32:11&flight-0-arrival-iata=JFK&flight-0-departure-date-time=2023-10-26T23:32:11&flight-0-departure-iata=DUB&flight-0-number=AB1234&flight-1-arrival-date-time=2023-11-03T22:32:11&flight-1-arrival-iata=DUB&flight-1-departure-date-time=2023-11-02T22:32:11&flight-1-departure-iata=JFK&flight-1-number=CD1234&pax=3&pnr=ABCD4321&residence-id=IE&user-age=30)

A complete example

## Reserving a car 
Adding ```book:true``` to the configuration object will add a "bookReference" element to each car returned by the SDK.

The bookReference is a pre-build API request message that can be used to reserve the car using CarTrawler's reservation API endpoint.

This message will contain a list of placeholder fields which are preset to default values. It is expected that these fields are overridden with meaningful booking data and the message is processed directly with our OTA_VehResRQ endpoint. Full details on how to use CarTrawler's OTA_VehResRQ endpoint and the API in general can be found in the official [API docs](https://docs.cartrawler.com/docs/xml/api-details/OTA_VehRes.html). 


## Insurance (coming soon)

## Tests (coming soon)


