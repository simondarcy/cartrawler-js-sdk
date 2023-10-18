//Wrapper for OTA_Ping
export async function getIP() {

    let url = "https://otageo.cartrawler.com/cartrawlerota/json?type=CT_IpToCountryRQ";
    let data = {
        "@Target": "Production",
        "@xmlns": "http://www.cartrawler.com/",
        "@Version": "1.000",
        "@PrimaryLangID": "en",
        "POS": {
            "Source": [{
                "@ERSP_UserID": "MP",
                "RequestorID": {
                    "@Type": "16",
                    "@ID": "122070",
                    "@ID_Context": "CARTRAWLER"
                }
            }]
        },
        "Context": {
            "SplittingDirective": "EXB"
        }
    }; //end data

    try {
        // We are using fetch to get the response
        let response = await fetch(url, {
            method:'POST',
            headers:{
            },
            body:JSON.stringify(data)
        });//end fetch 
        let responseData = await response.json();
        return responseData;
      } catch (error) {
        console.log(error);
      }

}

export default getIP;