# Zoom Meet Attendance
You can use this to who when attended the meeting and when left. This extension will 
collect information and will make a text file. You can create a graph using below 
Python script. All activities of this extension happens on your browser and never 
send any information anywhere.
## Limitation
You must show participants list otherwise extension won't be able to collect information.
![alt "show extension"](https://drive.google.com/uc?export=download&id=1F9D-Fovs3fmveWScrEf43vuJDmtNvH_T)
## How to use
### Load extension
<ol>
<li><h5>Clone the project.</h5>
<pre>
git clone https://github.com/mahbd/zoom_meet_attendance
</pre>
</li>
If you don't know how to load extension in chrome use this 
<a href="https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/">guide</a>.
</ol>

### Start the extension
Start your meeting
Show participants list like below
![alt "Zoom participants list"](https://drive.google.com/uc?export=download&id=1EcnO_JZ-ZY29vBHOjws6fGam9a-VgwBm)
<br> Image for zoom <br>
![alt "Meet participants list"](https://drive.google.com/uc?export=download&id=1AKwkyypou17lco9HdUjjI0-JGP9s0VK8)
<br>For meet<br>
Now click on the extension icon and click start.
![alt "Start"](https://drive.google.com/uc?export=download&id=16nsh1IVXdVXyV316-LVrmQsSHZJDNpxZ)
<br>
Before ending the meeting click save recording. As soon as you click save a text file will be downloaded.
![alt "Save"](https://drive.google.com/uc?export=download&id=10y2rpDARMckfEqAGfqxbPFNWr6zkFVP9)
You're done. You may visualize your data using below python script.
## Visualize using python script
If you want better visualization experience use you may use this 
<a href="https://github.com/mahbd/zoom_meet_attendance_visualizer">module</a>. Or use below code for basic
visualization.
### requirements 
numpy, matplotlib, seaborn
### code 
<pre>import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from matplotlib import pyplot

with open('your text file name', 'r') as file:
    lines = file.readlines()
    title = lines[0]
    names, data = [], []
    for line in lines[1:]:
        cols = line.strip().split(',')
        names.append(cols[0])
        data.append([int(x) for x in cols[1:]])
data = np.array(data)
print(data)
a4_dims = (11.7, 8.27)
fig, ax = pyplot.subplots(figsize=a4_dims)
sns.heatmap(ax=ax, data=data, cbar=False)
ax.set_title(title)
ax.set_yticklabels(names)
plt.setp(ax.get_yticklabels(), rotation=0, ha="right",
         rotation_mode="anchor")
for i in range(data.shape[0] + 1):
    ax.axhline(i, color='white', lw=2)
plt.show()
</pre>
### Examples
![alt "Examples"](https://drive.google.com/uc?export=download&id=17PxaauWlya3BuxTGddkOMCaiRmWQgUk8)