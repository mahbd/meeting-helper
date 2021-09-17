let allMembers = [], rangeMembers = [];
const buttonList = ["mic", "video", "people-cross", "people-plus", "live", "settings"];
let BrowserInstance = undefined, browserName = undefined;
const firefox = "firefox", chromeB = "chrome";

if (navigator.userAgent.indexOf("Chrome") !== -1) {
  browserName = chromeB;
  BrowserInstance = chrome;
} else if (navigator.userAgent.indexOf("Firefox") !== -1) {
  browserName = firefox;
  BrowserInstance = browser;
} else {
  alert('Browser is not supported for Meeting helper. Use Firefox or Google Chrome');
}

const sendMessage = (message) => {
  if (browserName === firefox || browserName === chromeB) {
    BrowserInstance.tabs.query({active: true, currentWindow: true},
      tabs => BrowserInstance.tabs.sendMessage(tabs[0].id, message));
  }
}

const addMember = (member) => {
  sendMessage([4, member]);

  if (rangeMembers.indexOf(member) !== -1) {
    alert("Member already exist")
  } else {
    rangeMembers.push(member);
  }
  sendMessage([3]); // request for all members and rangeMembers
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

// Item of list of members
const generateMemberItem = (value, f = "add") => {
  let child = document.createElement("li");
  let btnChild = document.createElement("button");
  let textChild = document.createElement('p');
  textChild.innerText = value;
  if (f === "remove") {
    btnChild.innerHTML = "<span style='color: white; background-color: red; padding-left: 10px; font-size: 1rem'>X</span>";
    btnChild.style.backgroundColor = "red";
    btnChild.onclick = () => removeMember(value);
  } else if (f === "add") {
    btnChild.innerHTML = "<span style='color: yellow; background-color: green; padding-left: 10px; font-size: 1rem'>+</span>";
    btnChild.style.backgroundColor = "green";
    btnChild.onclick = () => addMember(value);
  }
  textChild.appendChild(btnChild);
  child.appendChild(textChild);
  return child;
}

// What to do if message received
const handleMessage = (message, sender, sendResponse) => {
  sendResponse({status: true}); // send reply to tabs
  BrowserInstance.storage.local.get(function (result) {
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

// Remove active CSS from all navbar button (CSS deactivation only)
const inactiveAll = () => {
  for (let button of buttonList) {
    document.getElementById(button).classList.remove("active");
  }
}

// Function to remove member from range member
const removeMember = (member) => {
  sendMessage([5, member]); // remove member from tab data
  const memberIndex = rangeMembers.indexOf(member);
  if (memberIndex !== -1) {
    rangeMembers.splice(memberIndex, 1);
  }
  sendMessage([3]); // request for all members and rangeMembers
}

// Render live result in popup
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

// Show percent of presence in popup
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

// Button listeners
window.onload = () => {
  // Start button listener
  document.getElementById("startButton").addEventListener("click", () => {
    sendMessage([1]);
    BrowserInstance.storage.local.set({running: "1"});
    document.getElementById('startButton').style.display = "none";
    document.getElementById('stopButton').style.display = "block";
    document.getElementById('nav-btn').style.display = "block";
  });
  // Add new member button listener
  document.getElementById("add-member-btn").addEventListener("click", () => {
    const member = document.getElementById("included").value;
    document.getElementById("included").value = "";
    if (member) addMember(member);
  });

  // Navbar buttons listener
  for (let button of buttonList) {
    document.getElementById(button).addEventListener("click", () => {
      inactiveAll();
      BrowserInstance.storage.local.set({showing: buttonList.indexOf(button).toString()});
      document.getElementById(button).classList.add("active");
      if (button === "settings") { // different behaviour if clicked on + icon
        document.getElementById("setting-form").style.display = "block";
        sendMessage([3]); // request for all members and rangeMembers
      }
    });
  }

  // Stop button listener
  document.getElementById("stopButton").addEventListener("click", () => {
    sendMessage([2]);
    BrowserInstance.storage.local.set({running: "0"});
    document.getElementById('startButton').style.display = "block";
    document.getElementById('stopButton').style.display = "none";
    document.getElementById('nav-btn').style.display = "none";
  });

  // Set initial state by checking configuration from local storage
  BrowserInstance.storage.local.get(result => {
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

BrowserInstance.runtime.onMessage.addListener(handleMessage);