let params = {active: true, currentWindow: true};
let allMembers = [], rangeMembers = [];
const buttonList = ["mic", "video", "people-cross", "people-plus", "live", "settings"];

const addMember = (member) => {
  chrome.tabs.query(params, tabs => chrome.tabs.sendMessage(tabs[0].id, [4, member]));

  if (rangeMembers.indexOf(member) !== -1) {
    alert("Member already exist")
  } else {
    rangeMembers.push(member);
  }
  fillSettingsRequest();
}

const fillSettingsHelper = () => {
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
    suggested.appendChild(generateMemberItem(member));
  }
  const current = document.getElementById("current-member-list");
  current.innerHTML = "";
  for (let member of rangeMembers) {
    current.appendChild(generateMemberItem(member, "remove"));
  }
}

const fillSettingsRequest = () => {
  chrome.tabs.query(params, doIt);

  function doIt(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, [3]);
  }
}

const generateMemberItem = (value, f = "add") => {
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

const handleMessage = (message, sender, sendResponse) => {
  sendResponse({status: true});
  chrome.storage.local.get(function (result) {
    const showing = result.showing;
    if (showing === "0" && message.mutedList) {
      renderLiveResult(JSON.parse(message.mutedList).arr);
    } else if (showing === "1" && message.noVideo) {
      renderLiveResult(JSON.parse(message.noVideo).arr);
    } else if (showing === "2" && message.absentMembers) {
      renderLiveResult(JSON.parse(message.absentMembers).arr);
    } else if (showing === "3" && message.extraMembers) {
      renderLiveResult(JSON.parse(message.extraMembers).arr);
    } else if (showing === "4" && message.livePresent) {
      renderPercentPresent(JSON.parse(message.livePresent).arr)
    } else if (message.memberList) {
      allMembers = JSON.parse(message.memberList).allMembers;
      rangeMembers = JSON.parse(message.memberList).rangeMembers;
      fillSettingsHelper();
    }
  })
}

const inactiveAll = () => {
  for (let button of buttonList) {
    document.getElementById(button).classList.remove("active");
  }
}

const removeMember = (member) => {
  chrome.tabs.query(params, tabs => chrome.tabs.sendMessage(tabs[0].id, [5, member]));

  const memberIndex = rangeMembers.indexOf(member);
  if (memberIndex !== -1) {
    rangeMembers.splice(memberIndex, 1);
  }
  fillSettingsRequest();
}

const renderLiveResult = (arr) => {
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

const renderPercentPresent = (tableArr) => {
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

window.onload = () => {
  document.getElementById("startButton").addEventListener("click", function (permissionDesc) {
    chrome.tabs.query(params, tabs => chrome.tabs.sendMessage(tabs[0].id, [1]));
    chrome.storage.local.set({running: "1"});
    document.getElementById('startButton').style.display = "none";
    document.getElementById('stopButton').style.display = "block";
    document.getElementById('nav-btn').style.display = "block";
  });

  document.getElementById("add-member-btn").addEventListener("click", function () {
    const member = document.getElementById("included").value;
    document.getElementById("included").value = "";
    if (member) addMember(member);
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
    chrome.tabs.query(params, tabs => chrome.tabs.sendMessage(tabs[0].id, [2]));
    chrome.storage.local.set({running: "0"});
    document.getElementById('startButton').style.display = "block";
    document.getElementById('stopButton').style.display = "none";
    document.getElementById('nav-btn').style.display = "none";
  });

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
    if (showing) document.getElementById(buttonList[parseInt(showing)]).click();
  });
}

chrome.runtime.onMessage.addListener(handleMessage);