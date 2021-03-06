
var httpParse = require('http')
   ,httpsParse = require('https')
   ,jsdom = require('jsdom')
   ,request = require('request')
   ,mongoose = require('mongoose')
   ,urlModel = mongoose.model('url');


exports.parser=function(url, urlObj, cb){

  if (urlObj!=null){
    cb(null, urlObj);
    return    
  }

  var parsed=parseURI(url), parsedURL

  urlRequest(url, function(err, response, header){

    textScape(response, function(err, window){

      var title, favicon,titleJq;
      titleJq=window.$("title").text(), title= ( titleJq )? titleJq: parsed.authority+parsed.path;
      favicon=window.$("[rel='shortcut icon']").attr("href");
      if (typeof favicon!= "string") { 
        favicon=url.split("/")[0]+"//"+url.split("/")[2]+"/favicon.ico"  
      }
      if( favicon.slice(0, 1)=="/")
      favicon=parsed.protocol+"://"+parsed.domain+favicon;


      urlRequest(favicon, function(err, responseFavi, headerFavi){

        if ( headerFavi && headerFavi["content-length"]  && Number(headerFavi["content-length"])>0 ){
          //do nothing the favicon is good
        }else
          favicon=null;

        parsedURL=canconicalURL(parsed)

        urlObj=new urlModel({title:title, favicon:favicon, url:parsedURL })
        urlObj.save(function(err){
          if (err){ cb(err, null); return};
          cb(null, urlObj);
        });


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


    }else{
      callback(null, null, response.headers)

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


// urlFormate=function(url, callback){
//   var requestType, requestType, path, hostName, hostComp, subDomain, protocol;
//   if (url.search("https")!=-1){
//     urlHusk=url.split("https://")[1];
//     protocol="https://";
//     requestType=httpsParse;
//     port=443;
//     path=urlHusk.slice(urlHusk.search("/"));
//     hostName=urlHusk.slice(0,urlHusk.search("/"));
//     hostComp=hostName.slice(".")
//     if (hostComp.length==3)
//       hostName=hostComp[1]+"."+hostComp[2],
//       subDomain=hostComp[0];

//   }
//   else if (url.search("http")!=-1){
//     var urlHusk=url.split("http://")[1];
//     protocol="http://";
//     requestType=httpParse;
//     port=80;
//     path=urlHusk.slice(urlHusk.search("/"));
//     hostName=urlHusk.slice(0,urlHusk.search("/"));
//     hostComp=hostName.split(".")
//     if (hostComp.length==3)
//       hostName=hostComp[1]+"."+hostComp[2],
//       subDomain=hostComp[0];
//   }
//   else{
//     var urlHusk, split;
//     split=url.split("//")
//     if (split[0].length) urlHusk=split[0];
//     else if (split[1].length) urlHusk=split[1];
//     protocol="http://";
//     requestType=httpParse;
//     port=80;
//     path=urlHusk.slice(urlHusk.search("/"));
//     hostName=urlHusk.slice(0,urlHusk.search("/"));
//     hostComp=hostName.split(".")
//     if (hostComp.length==3)
//       hostName=hostComp[1]+"."+hostComp[2],
//       subDomain=hostComp[0];




//   }
//     return {protocol:protocol, port:port, hostName:hostName, path:path, requestType:requestType, subDomain:subDomain, }
//   //callback(null, {port:port, hostname:hostname, path:path, requestType:requestType});

// }



textScape=function(html, callback){
    jsdom.env(
      (typeof html=="string")? html:"<body>",
      ["http://code.jquery.com/jquery.js"],
      function(errors, window) {
        window.$("script").remove();
        callback(null, window)
      }
    );
};



canconicalURL=exports.canconicalURL=function(parsed){ return parsed.protocol+"://"+parsed.domain+parsed.path.replace(/\/$/g, '');}

parseURI=exports.parseURI=function(sourceUri){
    var uriPartNames = ["source","protocol","authority","domain","port","path","directoryPath","fileName","query","anchor"],
      uriParts = new RegExp("^(?:([^:/?#.]+):)?(?://)?(([^:/?#]*)(?::(\\d*))?)((/(?:[^?#](?![^?#/]*\\.[^?#/.]+(?:[\\?#]|$)))*/?)?([^?#/]*))?(?:\\?([^#]*))?(?:#(.*))?").exec(sourceUri),
      uri = {};
    
    for(var i = 0; i < 10; i++){
      uri[uriPartNames[i]] = (uriParts[i] ? uriParts[i] : "");
    }
    
    /* Always end directoryPath with a trailing backslash if a path was present in the source URI
    Note that a trailing backslash is NOT automatically inserted within or appended to the "path" key */
    if(uri.directoryPath.length > 0){
      uri.directoryPath = uri.directoryPath.replace(/\/?$/, "/");
    }
    
    return uri;
  };