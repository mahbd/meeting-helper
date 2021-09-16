chrome.runtime.onMessage.addListener(startIt);
let arrayAttendance = [];
let percentAttendance = {};
let totalSeconds = 0;
let rangeMembers = [];
let interval = [];
let intervalId = 0;
let today = new Date();
let month = today.getMonth();
let year = today.getFullYear();
let day = today.getDay();
let hours = today.getHours();
let file_name = "Attendance:" + hours + "hrs-" + day + "-" + month + ".txt";

window.onload = function () {
  window.sessionStorage.clear();
  chrome.storage.local.clear();
}

function startIt(message, sender, sendResponse) {
  if (message[0] === 1) {
    console.log("Taking attendance");
    interval[intervalId++] = setInterval(takeAttendance, 1000);
  } else if (message[0] === 2) {
    for (let i = 0; i < interval.length; i++) {
      clearInterval(interval[i]);
    }
    saveToFile();
  } else if (message[0] === 3) {
    const data = {rangeMembers, allMembers: Object.keys(percentAttendance)}
    chrome.runtime.sendMessage({memberList: JSON.stringify(data)}, function (response) {
    });
  } else if (message[0] === 4) {
    rangeMembers.push(message[1]);
  } else if (message[0] === 5) {
    const memberIndex = rangeMembers.indexOf(message[1]);
    if (memberIndex !== -1) {
      rangeMembers.splice(memberIndex, 1);
    }
  } else {
    console.log(message)
  }
}

const takeAttendance = () => {
  if (document.domain === "meet.google.com") {
    console.log("Taking attendance from meet")
    meetAttendance();
  }
  if (document.domain === "us04web.zoom.us" || document.domain === "bdren.zoom.us") {
    console.log("Taking attendance from zoom")
    zoomAttendance();
  }
}

const meetAttendance = () => {
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
  totalSeconds += 1;
}

const zoomAttendance = () => {
  const currentAttendance = [];
  const currentAllStatus = {};
  let muted = [];
  let noVideo = [];
  let memberList = document.getElementsByClassName("participants-item__item-layout");
  if (memberList.length === 0) {
    document.getElementsByClassName("footer-button__participants-icon")[0].click();
    memberList = document.getElementsByClassName("participants-item__item-layout");
  }
  for (let student of memberList) {
    let studentName = student.getElementsByClassName("participants-item__display-name")[0].innerText;
    currentAllStatus[studentName] = 5;
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
  totalSeconds += 1;
  genLivePresent(totalSeconds);
}


const genAbsentMembers = (currentMembers) => {
  const absentMembers = [];
  for (let member of rangeMembers) {
    if (currentMembers.indexOf(member) === -1) {
      absentMembers.push(member);
    }
  }
  saveAbsent(absentMembers);
}

const genExtraMembers = (currentMembers) => {
  const extraMembers = [];
  for (let member of currentMembers) {
    if (rangeMembers.indexOf(member) === -1) {
      extraMembers.push(member);
    }
  }
  saveExtra(extraMembers);
}

function saveMuted(mutedList = []) {
  let data = {arr: mutedList};
  chrome.runtime.sendMessage({mutedList: JSON.stringify(data)}, function (response) {
  });
}

function saveNoVideo(mutedList = []) {
  let data = {arr: mutedList};
  chrome.runtime.sendMessage({noVideo: JSON.stringify(data)}, function (response) {
  });
}

function saveAbsent(mutedList = []) {
  let data = {arr: mutedList};
  chrome.runtime.sendMessage({absentMembers: JSON.stringify(data)}, function (response) {
  });
}

function saveExtra(mutedList = []) {
  let data = {arr: mutedList};
  chrome.runtime.sendMessage({extraMembers: JSON.stringify(data)}, function (response) {
  });
}

const organizeData = () => {
  const allStudents = Object.keys(percentAttendance);
  let text = "Attendance of " + year + "-" + day + "-" + month + "hrs-" + hours + "\n";
  let arr = [text];
  for (let i = 0; i < allStudents.length; i++) {
    text = allStudents[i];
    for (let j = 0; j < arrayAttendance.length; j++) {
      let found = 0;
      if (arrayAttendance[j][allStudents[i]] !== undefined) {
        found = arrayAttendance[j][allStudents[i]] + 1;
      }
      text += "," + found;
    }
    text += '\n';
    arr.push(text);
  }
  return arr;
}

const saveToFile = () => {
  const text = organizeData();
  const pData = new Blob(text, {type: 'text/plain'});
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = URL.createObjectURL(pData);
  a.download = file_name;
  a.click();

  URL.revokeObjectURL(a.href)
  a.remove();
}
