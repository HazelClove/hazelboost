# HazelBoost

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?logo=googlechrome&logoColor=white)
![Firefox Add-on](https://img.shields.io/badge/Firefox-Add--on-orange?logo=firefox&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![License](https://img.shields.io/badge/License-MIT-lightgrey)
![Version](https://img.shields.io/badge/Version-1.4.2-blueviolet)

Cross-browser extension [Chrome](https://www.google.com/chrome/) + [Firefox](https://www.firefox.com/en-GB/) that kills laggy stuff on websites.

Turns off CSS animations, transitions, blurs, shadows, and smooth scrolling. Throttles `requestAnimationFrame` and `setInterval` loops. Optional toggles to block WebGL and GSAP entirely for sites that still lag. Whitelist and blacklist included.

## Heads up!!

Using one `manifest.json` for both browsers means Chrome will show a yellow warning about `background.scripts` in `chrome://extensions`. It's harmless. The extension works fine ^_^

## How to setup

### Chrome:

1. Go to `chrome://extensions`
<br><img width="600" alt="image" src="https://github.com/user-attachments/assets/4c4be989-7342-4bf3-be18-ab45811d693a" />

2. Enable Developer Mode
<br><img width="600" alt="image" src="https://github.com/user-attachments/assets/642752fe-4e21-4b1e-a762-73890b22062e" />

3. Press 'Load Unpacked'
<br><img width="300" alt="image" src="https://github.com/user-attachments/assets/f581e93a-f5aa-4462-a8ab-98518327e4d4" />

4. Pack the files you downloaded into a folder and select it
<br><img width="600" alt="image" src="https://github.com/user-attachments/assets/958ed310-6b84-4942-8ca5-1dcde4b0bc9c" />

5. Done! Enjoy.

### Firefox:

1. Visit `about:debugging`
<br><img width="600" alt="image" src="https://github.com/user-attachments/assets/5b143b4f-b11e-47de-a166-13a415e8b0bd" />

2. Select "This Firefox"
<br><img width="300" alt="image" src="https://github.com/user-attachments/assets/bbd0387e-71d3-42cc-bb9b-2957c31627dc" />

3. Press "Load Temporary Addon"
<br><img width="600" alt="image" src="https://github.com/user-attachments/assets/a847c773-ba95-4b7a-bea9-16031526a61f" />

4. Select the `manifest.json` inside the folder you made (Must be in the folder with the other stuff!!!!)
<br><img width="600" alt="image" src="https://github.com/user-attachments/assets/ad4ecf8b-2726-482a-8a96-cdfc2f1bede3" />

5. Done. Enjoy!
