# Meeting helper

You can use this to who when attended the meeting and when left. You can also see when a user turned his microphone or
camera off. This extension will collect information during meeting and will make a text file and HTML graph report. You
can use the graph directly for good overview of the participants. Also, you can use the Text file for further
processing. All activities of this extension happens on your browser and never make any HTTP request nor save
permanently.

## Features

1. See a list of participants whose microphone is off.
2. See a list of participants whose video is off.
3. See absent participants list.
4. See extra participants list.
5. See how much time a participants was active.
6. A text file with realtime data when extension stopped.
7. A HTML file with realtime graph data when extension stopped

### Meaning of color and number in HTML and Text file

1. 0 and red color stand for absent
2. 1 and black color stand for present but microphone and video was off
3. 3 and yellow stand for present but video was off
4. 4 and blue color stand for present but microphone was off
5. 6 and green color stand for present and microphone and video was on.

<em>Each pixel in html stands for 1 seconds</em><br>
<em>These indicator works only in Zoom. These features are not supported in Google meet.</em>

## Issues
If Zoom meeting url doesn't start with <code>us04web</code> or <code>bdren</code> this
extension won't work. If this happens please change url to <code> https://us04web.zoom.us/... </code> 
in your browser address bar. For more details check <a href=https://github.com/mahbd/meeting-helper/issues/1>here</a>

## How to Install

Firefox's users can install this extension directly from 
<a href=https://addons.mozilla.org/en-US/firefox/addon/meeting-helper/>Firefox Addon Store</a>

For Google Chrome users: 
<ol>
<li><h5>Clone the project.</h5>
<pre>
git clone https://github.com/mahbd/meeting-helper.git
</pre>
</li>
<li>
Load the folder in your preferred browser. Firefox and Google chrome is supported.
</li>
</ol>
If you don't know how to load extension in chrome use this 
<a href="https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/">guide</a>

## User guide

<ol>
<li>
Start or join in your meeting.
</li>
<li>
Click on meeting helper icon.
</li>
<li>
Click on start button to start extension function.

![Alt text](images/start_the_extension.png?raw=true "Start meeting helper")
</li>
<li>
Click on microphone off icon to see whose microphone is off.

![Alt text](images/microphone.png?raw=true "Microphone")
</li>
<li>Click on video off icon to view whose video is off</li>
<li>Click on people cross icon to see who are absent from meeting</li>
<li>Click on people plus icon to see extra member list who are not
part of the meeting</li>
<li>Click on multi round button to see how much time a user is present.
(Google Meet reduce 1 second).

![Alt text](images/percent_present.png?raw=true "Percent")
</li>
<li>Click on plus icon to add new member. This won't add a member
to the meeting. This is just to see who is absent and extra member
list. You can click on suggested member to add new member or you can
manually enter user using input box. You can remove member by clicking
X icon. Again this will not remove user from meeting. This will be used
to list absent and extra members.</li>
<li>Click on Stop button. Two file will be downloaded automatically. One
is text file another is HTML file. The HTML file will looks like

![Alt text](images/report.png?raw=true "Report")
</li>
</ol>
