<div align="center">

# ⚡ StreamVault
### Universal Multi-Platform Video & Audio Downloader

*Download videos, reels, stories, and audio tracks from YouTube, Instagram, Facebook, TikTok, Twitter/X, Reddit, and 1,000+ websites.*

<br/>

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB.svg?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![yt--dlp](https://img.shields.io/badge/yt--dlp-2024%2B-red.svg?style=for-the-badge&logo=youtube&logoColor=white)](https://github.com/yt-dlp/yt-dlp)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6.svg?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

</div>

---

## 📖 Overview

**StreamVault** is a fast, full-stack web application designed to download media effortlessly across major social media and video sharing networks. It features an asynchronous **FastAPI** backend coupled with **`yt-dlp`** and **embedded FFmpeg**, and a sleek, responsive, glassmorphic **HTML5/CSS3/Vanilla JS** frontend that works on any device.

Whether you're pasting a high-definition YouTube video with multi-language audio dubs, an Instagram Reel, a Facebook Watch clip, or a viral TikTok, StreamVault automatically identifies the source, extracts metadata, provides custom quality controls, and streams the finished file directly to your device.

---

## 🌐 Supported Platforms

| Platform | Supported Media Formats | Supported Features |
| :--- | :--- | :--- |
| **YouTube** | Standard Videos, Shorts, Music | Up to 1080p+ Full HD, Multi-Language Audio Dubs, Subtitles |
| **Instagram** | Reels, Posts, IGTV, Stories | Direct MP4 Video & Studio Audio Extraction |
| **Facebook** | Watch Videos, Public Reels, Page Videos | High Definition (HD) & Standard (SD) MP4 |
| **TikTok** | Videos, Soundtracks | Clean MP4 Video & Extracted MP3 Audio |
| **Twitter / X** | Video Tweets, GIFs | Native MP4 Video |
| **Reddit** | Videos (`v.redd.it`), GIF Clips | Auto Video + Audio Muxing to MP4 |
| **Pinterest** | Video Pins, Idea Pins | Direct MP4 Video |
| **1,000+ Others** | Vimeo, Dailymotion, Twitch Clips, SoundCloud, etc. | Automatic universal extractor fallback |

---

## ✨ Key Features

- **🚀 Dynamic Platform Detection**:
  Instantly recognizes links from YouTube, Instagram, Facebook, TikTok, Twitter/X, and Reddit as you paste them, showing branded badges and tailored options.

- **🎛️ Comprehensive Quality & Format Selector**:
  - **Video**: MP4 (maximum compatibility) or WebM with selectable resolutions (1080p Full HD, 720p HD, 480p, 360p, or Best Original).
  - **Audio Only**: Extract high-fidelity audio in MP3 (up to 320kbps studio bitrate), M4A (AAC), or lossless WAV.

- **🗣️ Multi-Language Audio Track Selection**:
  YouTube videos featuring multi-language dubs (e.g., English, Hindi, Spanish, Japanese) are automatically detected, letting you choose your preferred spoken track.

- **🛡️ Built-in Bot & Verification Bypass**:
  Includes automated mobile client fallback (`android` / `ios`) and integrated Node.js JavaScript signature resolution to bypass YouTube's *"Sign in to confirm you're not a bot"* challenges.

- **🍪 Session Cookies & Authentication Modal**:
  Download private Instagram stories, followers-only posts, private Facebook group videos, or age-restricted YouTube videos by pasting or uploading `cookies.txt`.

- **📊 Real-Time Progress Bar & ETA**:
  Live updates displaying download percentage, real-time transfer speed (MB/s), and estimated time remaining (ETA).

- **📱 Fully Responsive Design**:
  Crafted with modern CSS Grid, Flexbox, and ambient glowing orbs. Tested and optimized for smartphones, tablets, laptops, and ultra-wide screens.

- **🧹 Automatic Server Cleanup**:
  Completed files are automatically cleaned up from the server's temporary storage once delivered to the user to prevent disk exhaustion.

---

## 🏗️ Project Architecture

```
youtube_downloader/
│
├── main.py                 # FastAPI application, background tasks & yt-dlp engine
├── requirements.txt        # Python dependency manifest
├── run.bat                 # One-click Windows startup script
├── README.md               # Complete project documentation
├── cookies.txt             # (Optional) Saved authentication cookies for restricted content
│
├── downloads/              # Temporary download staging directory (auto-cleaned)
│
└── static/                 # Frontend Assets
    ├── index.html          # Semantic HTML5 layout & modal structure
    ├── style.css           # Responsive styling, glassmorphism & media queries
    └── script.js           # Dynamic URL detection, API polling & UI controllers
```

---

## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **Server**: [Uvicorn](https://www.uvicorn.org/) (Lightning-fast ASGI server)
- **Extraction Engine**: [`yt-dlp`](https://github.com/yt-dlp/yt-dlp)
- **Media Processing**: [`imageio-ffmpeg`](https://github.com/imageio/imageio-ffmpeg) (Self-contained standalone FFmpeg binary)
- **Validation**: Pydantic v2

### Frontend
- **Markup**: Semantic HTML5
- **Styling**: Modern CSS3 (CSS Custom Properties, Grid, Flexbox, Glassmorphism, Animations)
- **Icons**: Font Awesome 6
- **Typography**: Google Fonts (*Plus Jakarta Sans*)
- **Scripting**: Vanilla JavaScript (Async/Await, Fetch API, Clipboard API)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Python 3.10+** ([python.org](https://www.python.org/downloads/))
- **Node.js** ([nodejs.org](https://nodejs.org/)) *(recommended for solving YouTube JS signature challenges)*

### 2. Clone or Open the Project Directory
```powershell
cd c:\Users\prsho\OneDrive\Desktop\PythonFullStack\youtube_downloader
```

### 3. (Optional) Create a Virtual Environment
```powershell
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS / Linux:
source venv/bin/activate
```

### 4. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 5. Launch the Application

#### Option A: One-Click (Windows)
Double-click `run.bat` in the project root.

#### Option B: Terminal Command
```powershell
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 6. Access the Web App
Open your favorite web browser and navigate to:
```
http://localhost:8000
```

---

## 🎮 How to Use

1. **Paste Link**: Copy any link from YouTube, Instagram, Facebook, TikTok, or Twitter/X and paste it into the search box (or click the **Paste** button).
2. **Analyze**: Click **Analyze** (or press Enter). The system detects the platform and displays the thumbnail, title, channel/creator, and available options.
3. **Customize Preferences**:
   - Choose **Video** or **Audio Only**.
   - Choose resolution (1080p, 720p, etc.) or audio bitrate (320kbps, 192kbps, 128kbps).
   - Select your preferred container (MP4, WebM, MP3, M4A, WAV).
   - If available, pick the audio language track or captions.
4. **Download**: Click **Start Download**. Watch the real-time progress bar and speed meter.
5. **Save to Device**: When processing completes, your browser will automatically save the file (or click **Save File**).

---

## 🍪 Cookies & Authentication Guide

Some content is protected by platforms:
- **YouTube**: Age-restricted videos or strict bot detection (`HTTP 429` / *"Sign in to confirm you're not a bot"*).
- **Instagram**: Private accounts, restricted reels, or Stories.
- **Facebook**: Private groups or friend-only videos.

### How to add cookies in 30 seconds:
1. Install the free browser extension **"Get cookies.txt locally"** ([Chrome Web Store](https://chromewebstore.google.com/) or Firefox Add-ons).
2. Open the platform in your browser (e.g. `youtube.com`, `instagram.com`, or `facebook.com`) while signed in.
3. Click the extension icon and select **Export** (or Copy).
4. In StreamVault, click the **"🍪 Cookies"** button at the top header.
5. Upload the downloaded `cookies.txt` file or paste the text content, and click **Save Cookies**.
6. The badge will turn green (**Cookies: Active**), allowing you to download any restricted media seamlessly!

---

## 📡 REST API Reference

StreamVault provides clean REST endpoints that can be integrated into external scripts or frontends:

### 1. `POST /api/info`
Analyzes media URL and returns metadata, available resolutions, audio tracks, and platform info.
- **Request Body**:
  ```json
  {
    "url": "https://www.youtube.com/watch?v=bKxAAwg4nu4"
  }
  ```
- **Response**:
  ```json
  {
    "title": "Song Title",
    "thumbnail": "https://i.ytimg.com/vi/.../maxresdefault.jpg",
    "duration": "3:28",
    "duration_seconds": 208,
    "channel": "Channel Name",
    "views": "433.5K",
    "resolutions": ["1080p", "720p", "480p", "360p"],
    "audio_languages": ["hi", "en"],
    "subtitles": ["en", "es"],
    "platform": {
      "id": "youtube",
      "name": "YouTube",
      "icon": "fa-brands fa-youtube",
      "color": "#ff334b"
    }
  }
  ```

### 2. `POST /api/start-download`
Starts an asynchronous background download job.
- **Request Body**:
  ```json
  {
    "url": "https://www.youtube.com/watch?v=...",
    "format_type": "video",
    "quality": "1080",
    "container": "mp4",
    "audio_language": "hi",
    "subtitle_language": null
  }
  ```
- **Response**:
  ```json
  {
    "task_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
  ```

### 3. `GET /api/progress/{task_id}`
Returns live progress metrics for an ongoing job.
- **Response**:
  ```json
  {
    "status": "downloading",
    "percent": 68.4,
    "speed": "14.20 MB/s",
    "eta": "4s",
    "filename": null
  }
  ```

### 4. `GET /api/get-file/{task_id}`
Streams the final file as a download attachment to the client and schedules file cleanup.

### 5. `GET /api/cookies-status`
Returns whether active cookies are stored on the server.

### 6. `POST /api/save-cookies-text` / `POST /api/upload-cookies`
Saves or uploads custom cookies to bypass restrictions.

### 7. `DELETE /api/delete-cookies`
Clears saved cookies from the server.

---

## ❓ Troubleshooting & FAQ

<details>
<summary><strong>Q: YouTube returns "Sign in to confirm you're not a bot"</strong></summary>

StreamVault automatically invokes an Android/iOS player fallback that solves this for 95% of videos. If the video is strictly protected or age-restricted, click the **"Cookies"** button in the header and paste your `cookies.txt` exported from YouTube.
</details>

<details>
<summary><strong>Q: Why does audio conversion (MP3) take a few seconds after download?</strong></summary>

The backend uses FFmpeg to transcode the source audio into high-fidelity MP3 (up to 320kbps). The progress bar will indicate `Processing final file...` during this fast transcoding stage.
</details>

<details>
<summary><strong>Q: Can I download private Instagram Reels or Stories?</strong></summary>

Yes! Export your Instagram cookies using the "Get cookies.txt locally" extension while logged into Instagram, upload them via the **Cookies** button in StreamVault, and paste the private Reel/Story URL.
</details>

<details>
<summary><strong>Q: How do I change the server port?</strong></summary>

Run Uvicorn with your desired port flag:
```powershell
python -m uvicorn main:app --host 0.0.0.0 --port 5000
```
</details>

---

## ⚖️ Legal Disclaimer

This tool is created for educational and personal archiving purposes only. Users are responsible for complying with the terms of service and copyright regulations of the respective platforms from which media is downloaded.

---

<div align="center">
  <sub>Built with ❤️ using FastAPI, yt-dlp, and Modern Web Standards.</sub>
</div>
