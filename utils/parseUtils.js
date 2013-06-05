
var httpParse = require('http')
   ,httpsParse = require('https')
   ,jsdom = require('jsdom')
   ,request = require('request');


exports.parser=function(url, cb){
//  urlObj=urlFormate(url)// ,function(err, urlObj){

  urlRequest(url, function(err, response, header){

    textScape(response, function(err, window){

      var title, favicon;
      title=window.$("title").text()
      favicon=window.$("[rel='shortcut icon']").attr("href")
      if (typeof favicon!= "string") { 
        favicon=url.split("/")[0]+"//"+url.split("/")[2]+"/favicon.ico"  
        //urlFaviObj=urlFormate(favicon)
       // urlFaviObj.subDomain=null  //scrape out the sub domain
      }

      //console.log(urlFaviObj)

      //console.log(urlFaviObj.subDomain)
      urlRequest(favicon, function(err, responseFavi, headerFavi){

        if ( headerFavi["content-type"].match(/image/i) ){
          // favicon=+urlFaviObj.protocol;
          // if (urlFaviObj.subDomain)favicon=+urlFaviObj.subDomain;
          // favicon=+urlFaviObj.hostName+"/favicon.ico";
        }else
          favicon=null;

        cb(null, {title:title, favicon:favicon});


      });

    })
    
  })


}


urlRequest=function(url, callback){

  request(url, function (error, response, body) {
    if (!error && (response.statusCode == 200 || response.statusCode == 304) ) {
      //console.log(body) // Print the google web page.

      callback(null, body, response.headers)

  // jsdom.env(
  //   body,
  //   ["http://code.jquery.com/jquery.js"],
  //   function(errors, window) {
  //     //console.log("contents of a.the-link:", window.$("a.the-link").text());

  //     //console.log( window.$("p").text() )

  //     callback(null, response, header)
  //   }
  // );


    }
  });

  // var fullHostname=optionsObj.hostName
  // if (optionsObj.subDomain && optionsObj.subDomain.length) fullHostname=optionsObj.subDomain+"."+fullHostname;
  
  // console.log(fullHostname)

  // var options = {
  //   hostname: fullHostname,
  //   port: optionsObj.port,
  //   path: optionsObj.path,
  //   method: 'GET'
  // };



  // var reqURL = optionsObj.requestType.request(options, function(resURL) {
  //   //console.log("statusCode: ", resURL.statusCode);
  //   //console.log("headers: ", resURL.headers);
  //   var response=""
  //   resURL.on('data', function(chunk) {
  //    // process.stdout.write(d);
  //   response += chunk;

  //   });
  //   resURL.on('end', function(){
  //     callback(null, response, resURL.headers)

  //   });
  // });
  // reqURL.end();

  // reqURL.on('error', function(e) {
  //   console.error(e);
  // });
}


urlFormate=function(url, callback){
  var requestType, requestType, path, hostName, hostComp, subDomain, protocol;
  if (url.search("https")!=-1){
    urlHusk=url.split("https://")[1];
    protocol="https://";
    requestType=httpsParse;
    port=443;
    path=urlHusk.slice(urlHusk.search("/"));
    hostName=urlHusk.slice(0,urlHusk.search("/"));
    hostComp=hostName.slice(".")
    if (hostComp.length==3)
      hostName=hostComp[1]+"."+hostComp[2],
      subDomain=hostComp[0];

  }
  else if (url.search("http")!=-1){
    var urlHusk=url.split("http://")[1];
    protocol="http://";
    requestType=httpParse;
    port=80;
    path=urlHusk.slice(urlHusk.search("/"));
    hostName=urlHusk.slice(0,urlHusk.search("/"));
    hostComp=hostName.split(".")
    if (hostComp.length==3)
      hostName=hostComp[1]+"."+hostComp[2],
      subDomain=hostComp[0];
  }
  else{
    var urlHusk, split;
    split=url.split("//")
    if (split[0].length) urlHusk=split[0];
    else if (split[1].length) urlHusk=split[1];
    protocol="http://";
    requestType=httpParse;
    port=80;
    path=urlHusk.slice(urlHusk.search("/"));
    hostName=urlHusk.slice(0,urlHusk.search("/"));
    hostComp=hostName.split(".")
    if (hostComp.length==3)
      hostName=hostComp[1]+"."+hostComp[2],
      subDomain=hostComp[0];




  }
    return {protocol:protocol, port:port, hostName:hostName, path:path, requestType:requestType, subDomain:subDomain}
  //callback(null, {port:port, hostname:hostname, path:path, requestType:requestType});

}



textScape=function(html, callback){
    jsdom.env(
      html,
      ["http://code.jquery.com/jquery.js"],
      function(errors, window) {
        window.$("script").remove();
        callback(null, window)
      }
    );
}