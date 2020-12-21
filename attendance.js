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
    if (message[0] === 1) {
        console.log("Taking attendance");
        interval[intervalId++] = setInterval(takeAttendance, 10000);
    } else {
        for (let i = 0; i < interval.length; i++) {
            clearInterval(interval[i]);
        }
        saveToFile();
    }
}

const takeAttendance = () => {
    if (document.domain === "meet.google.com") {
        console.log("Taking attendance from meet")
        meetAttendance();
    }
    if (document.domain === "us04web.zoom.us") {
        console.log("Taking attendance from zoom")
        zoomAttendance();
    }
}

const meetAttendance = () => {
    const currentAttendance = [];
    const presentStudents = document.getElementsByClassName("ZjFb7c");
    if (presentStudents.length === 0) {
        alert("Please show participants list")
    } else {
        for (let i = 0; i < presentStudents.length; i++) {
            currentAttendance.push(presentStudents[i].innerHTML)
        }
        totalAttendance.push(currentAttendance);
    }
}

const zoomAttendance = () => {
    const currentAttendance = [];
    const presentStudents = document.getElementsByClassName("participants-item__display-name");
    if (presentStudents.length === 0) {
        alert("Please show participants list")
    } else {
        for (let i = 0; i < presentStudents.length; i++) {
            currentAttendance.push(presentStudents[i].innerHTML)
        }
        totalAttendance.push(currentAttendance);
    }
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
