chrome.runtime.onMessage.addListener(handleMessage);
let bgpage = chrome.extension.getBackgroundPage();
if (bgpage.word === "Page being used is ZOOM") {
  document.getElementById("time_div").style.display = "none";
}
let params = {
  active: true,
  currentWindow: true
}

const buttonList = ["mic", "video", "people-cross", "people-plus", "settings"];

function handleMessage(message, sender, sendResponse) {
  const showing = window.sessionStorage.getItem("showing");
  if (showing === "0" && message.mutedList) {
    renderMuted(JSON.parse(message.mutedList).arr);
  } else if (showing === "1" && message.noVideo) {
    renderMuted(JSON.parse(message.noVideo).arr);
  } else if (showing === "2" && message.absentMembers) {
    renderMuted(JSON.parse(message.absentMembers).arr);
  } else if (showing === "3" && message.extraMembers) {
    renderMuted(JSON.parse(message.extraMembers).arr);
  }
  sendResponse({status: true});
}

window.onload = function () {
  document.getElementById("startButton").addEventListener("click", function () {
    const data = [];
    chrome.tabs.query(params, doIt);
    data.push(1);

    function doIt(tabs) {
      chrome.storage.local.set({running: "1"}, function () {
      });
      document.getElementById('startButton').style.display = "none";
      document.getElementById('stopButton').style.display = "block";
      document.getElementById('nav-btn').style.display = "block";
      chrome.tabs.sendMessage(tabs[0].id, data);
    }
  });

  for (let button of buttonList) {
    document.getElementById(button).addEventListener("click", function () {
      inactiveAll();
      window.sessionStorage.setItem("showing", buttonList.indexOf(button).toString())
      document.getElementById(button).classList.add("active");
      if (button === "settings") {
        document.getElementById("setting-form").style.display = "block";
      }
    });
  }

  document.getElementById("stopButton").addEventListener("click", function () {
    const data = [];
    chrome.tabs.query(params, doIt);
    data.push(2);

    function doIt(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, data);
      chrome.storage.local.set({running: "0"}, function () {
      });
      document.getElementById('startButton').style.display = "block";
      document.getElementById('stopButton').style.display = "none";
      document.getElementById('nav-btn').style.display = "none";
    }
  });

}

document.addEventListener('DOMContentLoaded', function () {
  // onClick's logic below:
  chrome.storage.local.get(function (result) {
    const running = result.running;
    if (running === "1") {
      document.getElementById('startButton').style.display = "none";
      document.getElementById('stopButton').style.display = "block";
      document.getElementById('nav-btn').style.display = "block";
    } else {
      document.getElementById('startButton').style.display = "block";
      document.getElementById('stopButton').style.display = "none";
      document.getElementById('nav-btn').style.display = "none";
    }
  });
});

function inactiveAll() {
  for (let button of buttonList) {
    document.getElementById(button).classList.remove("active");
  }
}

function renderMuted(arr) {
  document.getElementById("setting-form").style.display = "none";
  let parent = document.getElementById("live-result");
  parent.innerHTML = "";
  if (arr.length !== 0) {
    for (let ele of arr) {
      let child = document.createElement('p');
      child.innerText = ele;
      parent.appendChild(child);
    }
  } else {
    let child = document.createElement('p');
    child.innerText = "No member(s)"
    parent.appendChild(child);
  }
}

