console.log("POPUP Script in Action!");
load();
let bgpage = chrome.extension.getBackgroundPage();
if (bgpage.word === "Page being used is ZOOM") {
    document.getElementById("time_div").style.display = "none";
}
let params = {
    active: true,
    currentWindow: true
}
const config = 0;

function load() {
    chrome.storage.local.get('given_len', function (result) {
        let roll_len1 = result.given_len;
        //alert(result.given_len);
        const elem = document.querySelector('#rolllen');
        if (roll_len1 !== undefined) {
            elem.setAttribute("placeholder", roll_len1);
            elem.setAttribute("value", roll_len1);
        }
    });
}

window.onload = function () {

    document.getElementById("startButton").addEventListener("click", function () {
        const data = [];
        chrome.tabs.query(params, doIt);
        data.push(1);

        function doIt(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, data);
        }
    });

    document.getElementById("stopButton").addEventListener("click", function () {
        const data = [];
        chrome.tabs.query(params, doIt);
        data.push(2);

        function doIt(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, data);
        }
    });
}

