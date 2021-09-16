chrome.runtime.onMessage.addListener(startIt);
let totalAttendance = [];
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
  } else {
    console.log(message);
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
  let memberList = document.getElementsByClassName("KV1GEc");
  if (memberList.length === 0) {
    document.getElementsByClassName("VfPpkd-Bz112c-Jh9lGc")[8].click();
    memberList = document.getElementsByClassName("KV1GEc");
  }
  for (let member of memberList) {
    let memberName = member.getElementsByClassName("ZjFb7c")[0].innerText;
    currentAttendance.push(memberName)
  }
  totalAttendance.push(currentAttendance);
  genAbsentMembers(currentAttendance);
  genExtraMembers(currentAttendance);
}

const zoomAttendance = () => {
  const currentAttendance = [];
  let muted = [];
  let noVideo = [];
  let memberList = document.getElementsByClassName("participants-item__item-layout");
  if (memberList.length === 0) {
    document.getElementsByClassName("footer-button__participants-icon")[0].click();
    memberList = document.getElementsByClassName("participants-item__item-layout");
  }
  for (let student of memberList) {
    let studentName = student.getElementsByClassName("participants-item__display-name")[0].innerText;
    currentAttendance.push(studentName);
    if (student.getElementsByClassName("participants-icon__participants-unmute").length !== 0) {
      muted.push(studentName);
    }
    if (student.getElementsByClassName("participants-icon__participant-video--started participants-icon__participant-video").length === 0) {
      noVideo.push(studentName);
    }
  }
  totalAttendance.push(currentAttendance);
  saveMuted(muted);
  saveNoVideo(noVideo);
  genAbsentMembers(currentAttendance);
  genExtraMembers(currentAttendance);
}

const getRangeMembers = (start, end, included, excluded) => {
  for (let i = start; i <= end; i++) {
    rangeMembers.push(i);
  }
  for (let i of included.split(",")) {
    rangeMembers.push(i);
  }
  for (let i of excluded.split(",")) {

  }
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
  console.log(mutedList);
  chrome.runtime.sendMessage({mutedList: JSON.stringify(data)}, function (response) {
  });
}

function saveNoVideo(mutedList = []) {
  let data = {arr: mutedList};
  console.log(mutedList);
  chrome.runtime.sendMessage({noVideo: JSON.stringify(data)}, function (response) {
  });
}

function saveAbsent(mutedList = []) {
  let data = {arr: mutedList};
  console.log(mutedList);
  chrome.runtime.sendMessage({absentMembers: JSON.stringify(data)}, function (response) {
  });
}

function saveExtra(mutedList = []) {
  let data = {arr: mutedList};
  console.log(mutedList);
  chrome.runtime.sendMessage({extraMembers: JSON.stringify(data)}, function (response) {
  });
}

const organizeData = () => {
  console.table(totalAttendance);
  const allStudents = [];
  for (let i = 0; i < totalAttendance.length; i++) {
    if (totalAttendance[i] !== undefined) {
      for (let j = 0; j < totalAttendance[i].length; j++) {
        if (allStudents.indexOf(totalAttendance[i][j]) === -1) allStudents.push(totalAttendance[i][j]);
      }
    }
  }
  let text = "Attendance of " + year + "-" + day + "-" + month + "hrs-" + hours + "\n";
  let arr = [text];
  for (let i = 0; i < allStudents.length; i++) {
    text = allStudents[i];
    for (let j = 0; j < totalAttendance.length; j++) {
      let found = 0;
      if (totalAttendance[j].indexOf(allStudents[i]) !== -1) found = 1;
      text += "," + found;
    }
    text += '\n';
    arr.push(text);
  }
  return arr;
}

const saveToFile = () => {
  const text = organizeData();
  console.log("Running3")
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
