let arrayAttendance = [], intervalId = 0, interval = [], percentAttendance = {}, rangeMembers = [], totalSeconds = 0;
let today = new Date();
let month = today.getMonth(), year = today.getFullYear(), day = today.getDay(), hours = today.getHours();
let file_name = "Attendance:" + hours + "hrs-" + day + "-" + month;

let BrowserInstance = undefined;
let browserName = undefined;
const firefox = "firefox";
const chromeB = "chrome";
if (navigator.userAgent.indexOf("Chrome") !== -1) {
  BrowserInstance = chrome;
  browserName = chromeB;
} else if (navigator.userAgent.indexOf("Firefox") !== -1) {
  BrowserInstance = browser;
  browserName = firefox;
} else {
  alert('Browser is not supported for Meeting helper. Use Firefox or Google Chrome')
}

const sendMessageTab = (message) => {
  if (browserName === firefox || browserName === chromeB) BrowserInstance.runtime.sendMessage(message);
}

window.onload = function () {
  BrowserInstance.storage.local.set({running: "0"});
  BrowserInstance.storage.local.set({showing: "5"});

  if (document.domain === "us04web.zoom.us" || document.domain === "bdren.zoom.us" || document.domain === "zoom.us") {
    if (document.getElementsByClassName("VahdFMz0")[0]) {
      document.getElementsByClassName("VahdFMz0")[0].click();
      setTimeout(() => {
        const responseOpen = window.confirm("Want to start meeting from browser?");
        if (responseOpen) {
          const xpath = "//a[text()='Join from Your Browser']";
          const matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          if (matchingElement) {
            matchingElement.click();
          }
        }
      }, 1000);
    }
  }
}

const startIt = (message, sender, sendResponse) => {
  if (message[0] === 1) {
    interval[intervalId++] = setInterval(takeAttendance, 1000);
  } else if (message[0] === 2) {
    for (let i = 0; i < interval.length; i++) {
      clearInterval(interval[i]);
    }
    saveToFile();
  } else if (message[0] === 3) {
    const data = {rangeMembers, allMembers: Object.keys(percentAttendance)}
    sendMessageTab({memberList: JSON.stringify(data)});
  } else if (message[0] === 4) {
    if (rangeMembers.indexOf(message[1]) === -1) {
      rangeMembers.push(message[1]);
    }
  } else if (message[0] === 5) {
    const memberIndex = rangeMembers.indexOf(message[1]);
    if (memberIndex !== -1) {
      rangeMembers.splice(memberIndex, 1);
    }
  }
}

const takeAttendance = () => {
  if (document.domain === "meet.google.com") {
    meetAttendance();
  }
  if (document.domain === "us04web.zoom.us" || document.domain === "bdren.zoom.us" || document.domain === "zoom.us") {
    zoomAttendance();
  }
}

const meetAttendance = () => {
  totalSeconds += 1;
  const currentAttendance = [];
  const currentAllStatus = {};
  let memberList = document.getElementsByClassName("KV1GEc");
  if (memberList.length === 0) {
    document.getElementsByClassName("VfPpkd-Bz112c-Jh9lGc")[8].click();
    memberList = document.getElementsByClassName("KV1GEc");
  }
  for (let member of memberList) {
    let memberName = member.getElementsByClassName("ZjFb7c")[0].innerText;
    currentAllStatus[memberName] = 5;
    currentAttendance.push(memberName);
    percentAttendance[memberName] = (percentAttendance[memberName] || 0) + 1;
  }
  arrayAttendance.push(currentAllStatus);
  genAbsentMembers(currentAttendance);
  genExtraMembers(currentAttendance);
  genLivePresent();
}

// Extract information from zoom
const zoomAttendance = () => {
  totalSeconds += 1;
  const currentAttendance = [];
  const currentAllStatus = {};
  let muted = [];
  let noVideo = [];
  let memberList = document.getElementsByClassName("participants-item__item-layout");
  //
  if (memberList.length === 0) {
    document.getElementsByClassName("footer-button__participants-icon")[0].click();
    memberList = document.getElementsByClassName("participants-item__item-layout");
  }
  for (let student of memberList) {
    let studentName = student.getElementsByClassName("participants-item__display-name")[0].innerText;
    currentAllStatus[studentName] = 5;
    percentAttendance[studentName] = (percentAttendance[studentName] || 0) + 1;
    currentAttendance.push(studentName);
    if (student.getElementsByClassName("participants-icon__participants-unmute").length !== 0) {
      muted.push(studentName);
      currentAllStatus[studentName] -= 2;
    }
    if (student.getElementsByClassName("participants-icon__participant-video--started participants-icon__participant-video").length === 0) {
      noVideo.push(studentName);
      currentAllStatus[studentName] -= 3;
    }
  }
  arrayAttendance.push(currentAllStatus);
  saveMuted(muted);
  saveNoVideo(noVideo);
  genAbsentMembers(currentAttendance);
  genExtraMembers(currentAttendance);
  genLivePresent();
}

// Send message to plugin with percent of present time
const genLivePresent = () => {
  const table = [];
  for (let member in percentAttendance) {
    table.push([member, Math.ceil((percentAttendance[member] / totalSeconds) * 100)]);
  }
  table.sort((a, b) => a[1] - b[1]);
  let data = {arr: table};
  sendMessageTab({livePresent: JSON.stringify(data)});
}

// Send message to plugin with user list of absent members
const genAbsentMembers = (currentMembers) => {
  const absentMembers = [];
  for (let member of rangeMembers) {
    if (currentMembers.indexOf(member) === -1) {
      absentMembers.push(member);
    }
  }
  absentMembers.sort();
  let data = {arr: absentMembers};
  sendMessageTab({absentMembers: JSON.stringify(data)});
}

// Send message to plugin with user list of member who is not in range
const genExtraMembers = (currentMembers) => {
  const extraMembers = [];
  for (let member of currentMembers) {
    if (rangeMembers.indexOf(member) === -1) {
      extraMembers.push(member);
    }
  }
  extraMembers.sort();
  let data = {arr: extraMembers};
  sendMessageTab({extraMembers: JSON.stringify(data)});
}

// Send message to plugin with user list of microphone off
const saveMuted = (mutedList = []) => {
  mutedList.sort();
  let data = {arr: mutedList};
  sendMessageTab({mutedList: JSON.stringify(data)});
}

// Send message to plugin with user list of video off
const saveNoVideo = (noVideoList = []) => {
  noVideoList.sort();
  let data = {arr: noVideoList};
  sendMessageTab({noVideo: JSON.stringify(data)});
}

// Color per column for HTML report
const generateColumnColor = (code) => {
  if (code === 6) return "<span style=\"background-color: green; width: 1px; height: 20px; display: inline-block\"></span>";
  else if (code === 4) return "<span style=\"background-color: blue; width: 1px; height: 20px; display: inline-block\"></span>"
  else if (code === 3) return "<span style=\"background-color: yellow; width: 1px; height: 20px; display: inline-block\"></span>";
  else if (code === 1) return "<span style=\"background-color: black; width: 1px; height: 20px; display: inline-block\"></span>";
  else return "<span style=\"background-color: red; width: 1px; height: 20px; display: inline-block\"></span>";
}

// Create array of html and text for report
const organizeData = () => {
  const allStudents = Object.keys(percentAttendance);
  let text = "Attendance of " + year + "-" + day + "-" + month + "hrs-" + hours + "\n";
  let arr = [text];
  const rowArray = [`<h1>${text}</h1>`, "<table>", "<tr>"];
  for (let i = 0; i < allStudents.length; i++) {
    let htmlText = `<td>${allStudents[i]}</td><td>`;
    text = allStudents[i];
    for (let j = 0; j < arrayAttendance.length; j++) {
      let found = 0;
      if (arrayAttendance[j][allStudents[i]] !== undefined) {
        found = arrayAttendance[j][allStudents[i]] + 1;
      }
      htmlText += generateColumnColor(found)
      text += "," + found;
    }
    htmlText += "</td></tr>"
    text += '\n';
    arr.push(text);
    rowArray.push(htmlText);
  }
  return [arr, rowArray];
}

const saveToFile = () => {
  // Download text report
  const [arr, rowArray] = organizeData();
  const pData = new Blob(arr, {type: 'text/plain'});
  let a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = URL.createObjectURL(pData);
  a.download = file_name + ".txt";
  a.click();
  URL.revokeObjectURL(a.href)
  a.remove();

  // Download HTML report
  const htmlData = new Blob(rowArray, {type: 'text/plain'});
  a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = URL.createObjectURL(htmlData);
  a.download = file_name + ".html";
  a.click();
  URL.revokeObjectURL(a.href)
  a.remove();
}

BrowserInstance.runtime.onMessage.addListener(startIt);
