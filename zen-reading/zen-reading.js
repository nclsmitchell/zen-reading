$(document).ready(function(){

  var elems = [];
  var currentUrl = document.URL;

  //Send initial body information
  function sendMessage () {
    var tabBody = document.body.innerHTML;
    var tabUrl = currentUrl;

    chrome.runtime.sendMessage({req: "sendInfo", body: tabBody, url: tabUrl}, function(response) {
       console.log(response.res);
    });
  }

  //Get relevant body elements
  function getBodyElements () {
    var array = [];
    var len = $("body").find("*").length;

    for (var i = 0; i < len; i++) {
      var tag = $("body").find("*")[i];
      var tagName = tag.tagName.toLowerCase();
      var html = tag.innerHTML;

      if (/h[0-9]/.test(tagName)) {
        array[i] = {
          content: html,
          tagname: tagName,
          attr: ""
        };

        if (html.length > 280) {
          array[i].tagname = "p";
        }
      }

      if (tagName == "iframe" || tagName == "video") {
        array[i] = {
          content: i,
          tagname: tagName,
          attr: tag.attributes
        };
      }

      if (tagName == "p") {
        array[i] = {
          content: html,
          tagname: tagName,
          attr: ""
        };
      }
    }

    for (var j = 0; j < len; j++) {

      if (typeof array[j] != 'undefined') {
        elems.push(array[j]);
      }
    }

    elems = removeDuplicates(elems);
  }

  //Get rid of duplicate elements
  function removeDuplicates (arr) {
      var seen = {};
      var out = [];
      var len = arr.length;
      var j = 0;

      for (var i = 0; i < len; i++) {
         var item = arr[i];
         var content = item.content;

         if (seen[content] !== 1) {
           seen[content] = 1;
           out[j++] = item;
         }
      }
      return out;
  }

  //Clean body elements
  function removeBodyElements () {
    $("body").find("*").remove();
  }

  //Create zenMode environment
  function createZenMode () {
    $("body").append("<div class='zen-wrapper'></div>");

    for (var i = 0; i < elems.length; i++) {
      $(".zen-wrapper").append("<" + elems[i].tagname + ">" + elems[i].content + "</" + elems[i].tagname + ">");

      for (var j = 0; j < elems[i].attr.length; j++) {
        $(".zen-wrapper").children().last()[0].setAttribute(elems[i].attr[j].name, elems[i].attr[j].nodeValue);
      }
    }
    removeNoise();
  }

  //Get rid of Facebook and Twitter elements
  function removeNoise () {
    var zenWrapper = $(".zen-wrapper").find("*");

    for (var i = 0; i < zenWrapper.length; i++) {
      var attr = zenWrapper[i].attributes;

      for (var j = 0; j < attr.length; j++) {

        if (/facebook/i.test(attr[j].nodeValue)) {
          $(".zen-wrapper").find("*")[i].remove();
        }
        if (/twitter/i.test(attr[j].nodeValue)) {
          $(".zen-wrapper").find("*")[i].remove();
        }
      }
    }
  }

  //Get back to normal
  function removeZenMode (content) {
    removeBodyElements();
    $("body").append(content);
  }

  //Get back original body information
  function getMessage () {
    var body = document.body.innerHTML;

    chrome.runtime.sendMessage({req: "getInfo", url: currentUrl}, function(response) {
      console.log(response.res);

      if (response.url == currentUrl) {
        removeZenMode(response.body);
      }
      else {
        zenMode = false;
      }
    });
  }

  function zenReading () {

    //Activate zenMode
    if (zenMode === false) {
      sendMessage();
      getBodyElements();
      removeBodyElements();
      createZenMode();
    }
    //Get back to normal
    else {
      getMessage();
    }
  }

  zenReading();

});
