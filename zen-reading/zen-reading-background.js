var zenMode = false;
var body = [];

//Store body information
chrome.runtime.onMessage.addListener(

  function(request, sender, sendResponse) {

    if (request.req == "sendInfo") {
        body.push({
          content: request.body,
          url: request.url
        });
        sendResponse({res: "message send"});
    }

    if (request.req == "getInfo") {

      for (var i = 0; i < body.length; i++) {
        if (body[i].url == request.url) {
          sendResponse({res: "message received", body: body[i].content, url: request.url});
        }
      }
    }
  });

//Display active/inactive icon
chrome.browserAction.onClicked.addListener(function (tab) {

  chrome.tabs.executeScript(tab.id, {
      code: "var zenMode = " + zenMode.toString()
  }, function(results) {
      chrome.tabs.executeScript(tab.id, {
        file: "zen-reading.js"
      });
  });

  if (zenMode === false) {
    chrome.browserAction.setIcon({
      "path": "icon-zen-reading-active.png"
    });
    zenMode = true;
  }
  else {
    chrome.browserAction.setIcon({
      "path": "icon-zen-reading.png"
    });
    zenMode = false;
  }

});

//Back to inactive on tab change
chrome.tabs.onSelectionChanged.addListener(function (tab) {

  chrome.browserAction.setIcon({
    "path": "icon-zen-reading.png"
  });
});
