
$(function ($, Keen) {

    var home = function () {
    // create an event as a JS object

    if (username=="")
    	username=null

    var index = {
        username: username,
        location: window.location.href
    };

    // add it to the "purchases" collection
    Keen.addEvent("index", index);
};

	home();


}(jQuery, Keen));