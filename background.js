console.log("Background Script in Action!");
window.word = "Author-Shabinder B-)";
chrome.runtime.onMessage.addListener(receiver);
function receiver(request, sender, sendResponse) {
    if (request.text === "Page being used is ZOOM"){
        console.log(request.text);
        window.word=request.text;
    }else{
        window.word=request.text;
    }
}