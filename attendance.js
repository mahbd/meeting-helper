console.log("On Action")
chrome.runtime.onMessage.addListener(startIt);
const totalAttendance = [];
let today = new Date();
let month = today.getMonth();
let day = today.getDate();
let hours = today.getHours();
let file_name = "Attendance:" + hours + "hrs-" + day + "-" + month + ".txt";

function startIt(message, sender, sendResponse) {
    console.log(message);
    let startRec;
    if (message[0] === 1) {
        startRec = setInterval(takeAttendance, 60000);
    } else {
        clearInterval(startRec);
        console.log("Saving")
        saveToFile();
    }
}

function takeAttendance() {
    console.log("Taking Attendance");
    if (document.domain === "meet.google.com") {
        console.log("Using Google meet");
        meetAttendance();
    }
    if (document.domain === "zoom.us" || document.domain === "us04web.zoom.us") {
        zoomAttendance();
    }
}

const meetAttendance = () => {
    const currentAttendance = [];
    const presentStudents = document.getElementsByClassName("ZjFb7c");
    for (let i = 0; i < presentStudents.length; i++) {
        currentAttendance.push(presentStudents[i].innerHTML)
    }
    console.log("currentAttendance", currentAttendance)
    totalAttendance.push(currentAttendance)
}

const zoomAttendance = () => {

}

function saveToFile() {
    const pData = new Blob(totalAttendance, {type: 'text/plain'});
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = URL.createObjectURL(pData);
    a.download = file_name;
    a.click();

    URL.revokeObjectURL(a.href)
    a.remove();
}