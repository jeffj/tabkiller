
var httpParse = require('http')
   ,httpsParse = require('https')
   ,jsdom = require('jsdom');


exports.parser=function(url, cb){
    
   // console.log(url)



urlFormate(url,function(err, urlObj){

  urlRequest(urlObj, function(err, response){

    textScape(response, function(err, window){

       
        console.log( window.$("title").text() )
        cb();

    })
    


  })



})





}


urlRequest=function(optionsObj, callback){
  var options = {
    hostname: optionsObj.hostname,
    port: 447,
    path: optionsObj.path,
    method: 'GET'
  };



  var reqURL = httpsParse.request(options, function(resURL) {
    console.log("statusCode: ", resURL.statusCode);
    //console.log("headers: ", res.headers);
    var response=""
    resURL.on('data', function(chunk) {
     // process.stdout.write(d);
    response += chunk;

    });
    resURL.on('end', function(){


      callback(null, response)

    });
  });
  reqURL.end();

  reqURL.on('error', function(e) {
    //console.error(e);
  });
}


urlFormate=function(url, callback){
  var requestType, requestType, path, hostname;
  if (url.search("https")!=-1){
    urlHusk=url.split("https://")[1];
    requestType=httpsParse;
    path=urlHusk.slice(urlHusk.search("/"));
    hostname=urlHusk.slice(0,urlHusk.search("/"));
  }
  else if (url.search("http")!=-1){
    var urlHusk=url.split("http://")[1];
    requestType=httpParse;
    path=urlHusk.slice(urlHusk.search("/"));
    hostname=urlHusk.slice(0,urlHusk.search("/"));
  }

  console.log(url)
    console.log(path)


  callback(null, {hostname:hostname,path:path, requestType:requestType});

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