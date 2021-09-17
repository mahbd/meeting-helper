chrome.runtime.onMessage.addListener(handleMessage);
let bgpage = chrome.extension.getBackgroundPage();
if (bgpage.word === "Page being used is ZOOM") {
  document.getElementById("time_div").style.display = "none";
}
let params = {
  active: true,
  currentWindow: true
}

let allMembers = [];
let rangeMembers = [];

const buttonList = ["mic", "video", "people-cross", "people-plus", "live", "settings"];

function handleMessage(message, sender, sendResponse) {
  sendResponse({status: true});
  chrome.storage.local.get(function (result) {
    const showing = result.showing;
    if (showing === "0" && message.mutedList) {
      renderMuted(JSON.parse(message.mutedList).arr);
    } else if (showing === "1" && message.noVideo) {
      renderMuted(JSON.parse(message.noVideo).arr);
    } else if (showing === "2" && message.absentMembers) {
      renderMuted(JSON.parse(message.absentMembers).arr);
    } else if (showing === "3" && message.extraMembers) {
      renderMuted(JSON.parse(message.extraMembers).arr);
    } else if (showing === "4" && message.livePresent) {
      renderLive(JSON.parse(message.livePresent).arr)
    } else if (message.memberList) {
      allMembers = JSON.parse(message.memberList).allMembers;
      rangeMembers = JSON.parse(message.memberList).rangeMembers;
      fillSettingsHelper();
    }
  })
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

  document.getElementById("add-member-btn").addEventListener("click", function () {
    const member = document.getElementById("included").value;
    document.getElementById("included").value = "";
    if (member) {
      addMember(member);
    }
  });

  for (let button of buttonList) {
    document.getElementById(button).addEventListener("click", function () {
      inactiveAll();
      chrome.storage.local.set({showing: buttonList.indexOf(button).toString()}, function () {
      });
      document.getElementById(button).classList.add("active");
      if (button === "settings") {
        document.getElementById("setting-form").style.display = "block";
        fillSettingsRequest();
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
    const showing = result.showing;
    if (running === "1") {
      document.getElementById('startButton').style.display = "none";
      document.getElementById('stopButton').style.display = "block";
      document.getElementById('nav-btn').style.display = "block";
    } else {
      document.getElementById('startButton').style.display = "block";
      document.getElementById('stopButton').style.display = "none";
      document.getElementById('nav-btn').style.display = "none";
    }
    if (showing) {
      document.getElementById(buttonList[parseInt(showing)]).click()
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

function addMember(member) {
  chrome.tabs.query(params, doIt);

  function doIt(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, [4, member]);
  }

  if (rangeMembers.indexOf(member) !== -1) {
    alert("Member already exist")
  } else {
    rangeMembers.push(member);
  }
  fillSettingsRequest();
}

function removeMember(member) {
  chrome.tabs.query(params, doIt);

  function doIt(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, [5, member]);
  }

  const memberIndex = rangeMembers.indexOf(member);
  if (memberIndex !== -1) {
    rangeMembers.splice(memberIndex, 1);
  }
  fillSettingsRequest();
}

function getMemberItem(value, f = "add") {
  let child = document.createElement("li");
  let btnChild = document.createElement("button");
  let textChild = document.createElement('p');
  textChild.innerText = value;
  if (f === "remove") {
    btnChild.innerText = "X";
    btnChild.onclick = () => removeMember(value);
  } else if (f === "add") {
    btnChild.innerText = "+";
    btnChild.onclick = () => addMember(value);
  }
  textChild.appendChild(btnChild);
  child.appendChild(textChild);
  return child;
}

function fillSettingsRequest() {
  chrome.tabs.query(params, doIt);

  function doIt(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, [3]);
  }
}

function fillSettingsHelper() {
  let parent = document.getElementById("live-result");
  parent.innerHTML = "";
  let suggestedMembers = [];
  for (let member of allMembers) {
    if (rangeMembers.indexOf(member) === -1) {
      suggestedMembers.push(member);
    }
  }
  const suggested = document.getElementById("suggested-list");
  suggested.innerHTML = "";
  for (let member of suggestedMembers) {
    suggested.appendChild(getMemberItem(member));
  }
  const current = document.getElementById("current-member-list");
  current.innerHTML = "";
  for (let member of rangeMembers) {
    current.appendChild(getMemberItem(member, "remove"));
  }
}

const renderLive = (tableArr) => {
  const table = document.createElement('table')
  for (let rowArr of tableArr) {
    let row = document.createElement('tr');
    let col1 = document.createElement('td');
    let col2 = document.createElement('td');
    col1.innerText = rowArr[0];
    col2.innerText = `${rowArr[1]} %`;
    row.appendChild(col1);
    row.appendChild(col2);
    table.appendChild(row);
  }
  document.getElementById("setting-form").style.display = "none";
  let parent = document.getElementById("live-result");
  parent.innerHTML = "";
  parent.appendChild(table);
}

