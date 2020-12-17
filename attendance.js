console.log(document.domain, "Action")
chrome.runtime.onMessage.addListener(startIt);
let totalAttendance = [];
let interval = [];
let intervalId = 0;
let today = new Date();
let month = today.getMonth();
let year = today.getFullYear();
let day = today.getDay();
let hours = today.getHours();
let file_name = "Attendance:" + hours + "hrs-" + day + "-" + month + ".txt";

function startIt(message, sender, sendResponse) {
    console.log(message);
    if (message[0] === 1) {
        interval[intervalId++] = setInterval(takeAttendance, 10000);
    } else {
        for (let i = 0; i < interval.length; i++) {
            clearInterval(interval[i]);
        }
        saveToFile();
    }
}

function takeAttendance() {
    console.log("Taking attendance")
    if (document.domain === "meet.google.com") {
        meetAttendance();
    }
    if (document.domain === "us04web.zoom.us") {
        console.log("Zoom Running")
        zoomAttendance();
    }
}

const meetAttendance = () => {
    const currentAttendance = [];
    const presentStudents = document.getElementsByClassName("ZjFb7c");
    for (let i = 0; i < presentStudents.length; i++) {
        currentAttendance.push(presentStudents[i].innerHTML)
    }
    totalAttendance.push(currentAttendance);
}

const zoomAttendance = () => {
    const currentAttendance = [];
    const presentStudents = document.getElementsByClassName("participants-item__display-name");
    console.log(presentStudents);
    for (let i = 0; i < presentStudents.length; i++) {
        currentAttendance.push(presentStudents[i].innerHTML)
    }
    totalAttendance.push(currentAttendance);
}

const organizeData = () => {
    console.table(totalAttendance);
    const allStudents = [];
    for (let i = 0; i < totalAttendance.length; i++) {
        if (totalAttendance[i] !== undefined) {
            for (let j = 0; j < totalAttendance[i].length; j++) {
                console.log("Running0")
                if (allStudents.indexOf(totalAttendance[i][j]) === -1) allStudents.push(totalAttendance[i][j]);
            }
        }
    }
    console.log("Running1")
    let text = "Attendance of " + year + "-" + day + "-" + month + "hrs-" + hours + "\n";
    let arr = [text];
    for (let i = 0; i < allStudents.length; i++) {
        console.log("Running2");
        text = allStudents[i];
        for (let j = 0; j < totalAttendance.length; j++) {
            let found = 0;
            console.log("Array part", totalAttendance[i]);
            if (totalAttendance[i].indexOf(allStudents[i]) !== -1) found = 1;
            text += "," + found;
        }
        arr.push(text);
    }
    console.log(arr);
    return arr;
}

function saveToFile() {
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