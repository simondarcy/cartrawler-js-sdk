//Wrapper for OTA_Ping
import {testBaseURL, prodBaseURL} from './globals.js'
export async function ping(obj) {

    if(typeof obj !== "object"){
        return {'error':'Please pass an object'}
    }
    if(!obj.hasOwnProperty('message')){
        return {'error':'Please pass a message'}
    }
    if(typeof obj.message !== "string"){
        return {'error':'Message must be of type "string"'}
    }

    let debug = (obj.hasOwnProperty('debug') && obj.debug);

    //Check for env

    let url = `${(debug)?testBaseURL:prodBaseURL}?type=OTA_PingRQ`
    let data = {
        "@xmlns": "http://www.opentravel.org/OTA/2003/05",
        "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "@Target": `${(debug)?"Test":"Production"}`,
        "@Version": "1.003",
        "@PrimaryLangID": "EN",
        "EchoData": `${obj.message}`
       }

    try {
        // We are using fetch to get the response
        let response = await fetch(url, {
            method:'POST',
            headers:{
            },
            body:JSON.stringify(data)
        });//end fetch 
        let responseData = await response.json();
        if(debug) console.log(responseData);
        return responseData;
      } catch (error) {
        console.log(error);
      }

}

export default ping;