chrome.runtime.onMessage.addListener(receiver);
function receiver(request, sender, sendResponse) {
    if (request.text === "Page being used is ZOOM"){
        window.word=request.text;
    }else{
        window.word=request.text;
    }
}