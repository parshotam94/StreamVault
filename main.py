import os
import re
import uuid
import asyncio
import logging
import shutil
import time
from typing import Optional, Dict, Any, List
from pathlib import Path
from urllib.parse import urlparse

from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp

try:
    import imageio_ffmpeg
    FFMPEG_PATH = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FFMPEG_PATH = None

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("streamvault")

app = FastAPI(title="StreamVault - Universal Media Downloader", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
DOWNLOADS_DIR = BASE_DIR / "downloads"
DOWNLOADS_DIR.mkdir(exist_ok=True)
STATIC_DIR = BASE_DIR / "static"
STATIC_DIR.mkdir(exist_ok=True)
COOKIES_FILE = BASE_DIR / "cookies.txt"

# In-memory progress tracking
download_tasks: Dict[str, Dict[str, Any]] = {}

class VideoInfoRequest(BaseModel):
    url: str

class DownloadRequest(BaseModel):
    url: str
    format_type: str  # 'video' or 'audio'
    quality: str      # e.g., '1080', '720', '480', 'best', '320', '192', '128'
    container: str    # e.g., 'mp4', 'webm', 'mp3', 'm4a'
    audio_language: Optional[str] = None
    subtitle_language: Optional[str] = None

class CookieTextRequest(BaseModel):
    content: str

def detect_platform(url: str) -> Dict[str, str]:
    domain = urlparse(url).netloc.lower()
    if any(k in domain for k in ['youtube.com', 'youtu.be']):
        return {"id": "youtube", "name": "YouTube", "icon": "fa-brands fa-youtube", "color": "#ff334b"}
    elif any(k in domain for k in ['instagram.com', 'instagr.am']):
        return {"id": "instagram", "name": "Instagram Reel / Post", "icon": "fa-brands fa-instagram", "color": "#e1306c"}
    elif any(k in domain for k in ['facebook.com', 'fb.watch', 'fb.com', 'fb.gg']):
        return {"id": "facebook", "name": "Facebook Video / Reel", "icon": "fa-brands fa-facebook", "color": "#1877f2"}
    elif any(k in domain for k in ['tiktok.com']):
        return {"id": "tiktok", "name": "TikTok Video", "icon": "fa-brands fa-tiktok", "color": "#ff0050"}
    elif any(k in domain for k in ['twitter.com', 'x.com']):
        return {"id": "twitter", "name": "Twitter / X Video", "icon": "fa-brands fa-x-twitter", "color": "#1da1f2"}
    elif any(k in domain for k in ['reddit.com', 'redd.it']):
        return {"id": "reddit", "name": "Reddit Video", "icon": "fa-brands fa-reddit", "color": "#ff4500"}
    elif any(k in domain for k in ['pinterest.com', 'pin.it']):
        return {"id": "pinterest", "name": "Pinterest Media", "icon": "fa-brands fa-pinterest", "color": "#bd081c"}
    else:
        return {"id": "generic", "name": "Web Media", "icon": "fa-solid fa-globe", "color": "#a855f7"}

def format_duration(seconds: Optional[int]) -> str:
    if not seconds:
        return "Unknown"
    mins, secs = divmod(int(seconds), 60)
    hours, mins = divmod(mins, 60)
    if hours > 0:
        return f"{hours}:{mins:02d}:{secs:02d}"
    return f"{mins}:{secs:02d}"

def format_number(num: Optional[int]) -> str:
    if not num:
        return "0"
    if num >= 1_000_000_000:
        return f"{num / 1_000_000_000:.1f}B"
    if num >= 1_000_000:
        return f"{num / 1_000_000:.1f}M"
    if num >= 1_000:
        return f"{num / 1_000:.1f}K"
    return str(num)

def get_base_ydl_opts(platform_id: str, use_mobile_fallback: bool = False) -> Dict[str, Any]:
    opts: Dict[str, Any] = {
        'quiet': True,
        'no_warnings': True,
    }

    if FFMPEG_PATH:
        opts['ffmpeg_location'] = FFMPEG_PATH

    # Add cookies if available
    if COOKIES_FILE.exists() and COOKIES_FILE.stat().st_size > 10:
        opts['cookiefile'] = str(COOKIES_FILE)

    # YouTube-specific enhancements
    if platform_id == "youtube":
        opts['js_runtimes'] = {'node': {}}
        if use_mobile_fallback:
            opts['extractor_args'] = {
                'youtube': {
                    'player_client': ['android', 'ios']
                }
            }

    return opts

@app.get("/api/cookies-status")
async def get_cookies_status():
    exists = COOKIES_FILE.exists() and COOKIES_FILE.stat().st_size > 10
    return {"has_cookies": exists}

@app.post("/api/save-cookies-text")
async def save_cookies_text(req: CookieTextRequest):
    content = req.content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Cookies content cannot be empty")
    with open(COOKIES_FILE, "w", encoding="utf-8") as f:
        f.write(content)
    return {"message": "Cookies saved successfully", "has_cookies": True}

@app.post("/api/upload-cookies")
async def upload_cookies_file(file: UploadFile = File(...)):
    with open(COOKIES_FILE, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"message": "Cookies uploaded successfully", "has_cookies": True}

@app.delete("/api/delete-cookies")
async def delete_cookies():
    if COOKIES_FILE.exists():
        COOKIES_FILE.unlink()
    return {"message": "Cookies deleted", "has_cookies": False}

@app.post("/api/info")
async def get_video_info(request: VideoInfoRequest):
    url = request.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty")

    platform_info = detect_platform(url)
    platform_id = platform_info["id"]

    def try_extract(use_fallback: bool):
        opts = get_base_ydl_opts(platform_id, use_mobile_fallback=use_fallback)
        opts.update({
            'skip_download': True,
            'extract_flat': False,
        })
        with yt_dlp.YoutubeDL(opts) as ydl:
            return ydl.extract_info(url, download=False)

    info = None
    last_error = None

    try:
        info = await asyncio.to_thread(try_extract, False)
    except Exception as e:
        last_error = e
        logger.warning(f"Initial extraction failed: {e}")

    # Fallback for YouTube or general platform challenge
    if not info and platform_id == "youtube":
        try:
            info = await asyncio.to_thread(try_extract, True)
        except Exception as e:
            last_error = e
            logger.error(f"Fallback extraction failed: {e}")

    if not info:
        err_msg = str(last_error) if last_error else "Failed to access media"
        if "login" in err_msg.lower() or "bot" in err_msg.lower() or "429" in err_msg:
            raise HTTPException(
                status_code=400,
                detail=f"{platform_info['name']} requires authentication or cookies. Please click the 'Cookies' button at the top to add cookies."
            )
        raise HTTPException(status_code=400, detail=f"Failed to fetch media details: {err_msg}")

    # Extract available video resolutions
    formats = info.get('formats', [])
    video_resolutions = set()
    audio_languages = set()

    for f in formats:
        height = f.get('height')
        vcodec = f.get('vcodec')
        lang = f.get('language') or f.get('audio_language')

        if height and vcodec != 'none':
            video_resolutions.add(height)

        if lang and lang != 'none':
            audio_languages.add(lang)

    sorted_resolutions = sorted(list(video_resolutions), reverse=True)
    resolution_list = [f"{r}p" for r in sorted_resolutions]
    if not resolution_list:
        resolution_list = ["best", "HD", "SD"]

    # Thumbnail fallback
    thumb = info.get("thumbnail")
    if not thumb and info.get("thumbnails"):
        thumb = info.get("thumbnails")[-1].get("url")

    # Title fallback for Instagram / FB Reels which often don't have titles
    title = info.get("title") or info.get("description") or f"{platform_info['name']} Video"
    if len(title) > 90:
        title = title[:90] + "..."

    # Subtitles
    subtitles_available = list(info.get('subtitles', {}).keys())
    auto_subs = list(info.get('automatic_captions', {}).keys())
    all_subs = sorted(list(set(subtitles_available + auto_subs)))

    return {
        "title": title,
        "thumbnail": thumb or "",
        "duration": format_duration(info.get("duration")),
        "duration_seconds": info.get("duration", 0),
        "channel": info.get("uploader") or info.get("channel") or info.get("creator") or platform_info["name"],
        "views": format_number(info.get("view_count")),
        "description": (info.get("description") or "")[:200] + ("..." if len(info.get("description") or "") > 200 else ""),
        "resolutions": resolution_list,
        "audio_languages": sorted(list(audio_languages)),
        "subtitles": all_subs[:25],
        "platform": platform_info
    }

def progress_hook(d, task_id: str):
    if task_id not in download_tasks:
        return

    if d['status'] == 'downloading':
        total = d.get('total_bytes') or d.get('total_bytes_estimate') or 0
        downloaded = d.get('downloaded_bytes') or 0
        percent = (downloaded / total * 100) if total > 0 else 0
        speed = d.get('speed') or 0
        eta = d.get('eta') or 0

        speed_str = f"{speed / (1024 * 1024):.2f} MB/s" if speed else "Calculating..."
        eta_str = f"{eta}s" if eta else "Calculating..."

        download_tasks[task_id].update({
            "status": "downloading",
            "percent": round(percent, 1),
            "downloaded": downloaded,
            "total": total,
            "speed": speed_str,
            "eta": eta_str
        })
    elif d['status'] == 'finished':
        download_tasks[task_id].update({
            "status": "processing",
            "percent": 99.0,
            "eta": "Processing final file..."
        })

def run_download_task(task_id: str, req: DownloadRequest):
    try:
        url = req.url
        platform_info = detect_platform(url)
        platform_id = platform_info["id"]

        format_type = req.format_type
        container = req.container
        quality = req.quality.replace("p", "").lower()
        lang = req.audio_language

        out_template = str(DOWNLOADS_DIR / f"{task_id}_%(title).100s.%(ext)s")

        def build_opts(fallback: bool):
            opts = get_base_ydl_opts(platform_id, use_mobile_fallback=fallback)
            opts.update({
                'outtmpl': out_template,
                'progress_hooks': [lambda d: progress_hook(d, task_id)],
                'quiet': True,
                'no_warnings': True,
            })

            if format_type == 'audio':
                opts['format'] = 'bestaudio/best'
                if lang and lang != 'default':
                    opts['format'] = f'bestaudio[language={lang}]/bestaudio/best'

                audio_ext = container if container in ['mp3', 'm4a', 'wav'] else 'mp3'
                bitrate = req.quality if req.quality in ['128', '192', '320'] else '192'

                opts['postprocessors'] = [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': audio_ext,
                    'preferredquality': bitrate,
                }]
            else:
                # Video format selector
                if platform_id == "youtube":
                    audio_selector = f"[language={lang}]" if (lang and lang != 'default') else ""
                    if quality in ['best', 'hd', 'sd']:
                        opts['format'] = f'bestvideo+bestaudio{audio_selector}/best'
                    else:
                        opts['format'] = f'bestvideo[height<={quality}]+bestaudio{audio_selector}/best[height<={quality}]/best'
                else:
                    # Facebook, Instagram, TikTok, Twitter, etc.
                    opts['format'] = 'bestvideo+bestaudio/best'

                if container in ['mp4', 'm4v']:
                    opts['merge_output_format'] = 'mp4'
                elif container == 'webm':
                    opts['merge_output_format'] = 'webm'

            return opts

        # Execute download with fallback
        try:
            with yt_dlp.YoutubeDL(build_opts(False)) as ydl:
                info = ydl.extract_info(url, download=True)
        except Exception as e:
            if platform_id == "youtube":
                logger.warning(f"Standard download failed: {e}. Trying fallback...")
                with yt_dlp.YoutubeDL(build_opts(True)) as ydl:
                    info = ydl.extract_info(url, download=True)
            else:
                raise e

        target_files = list(DOWNLOADS_DIR.glob(f"{task_id}_*"))
        if target_files:
            actual_file = target_files[0]
            clean_name = re.sub(r'^[a-f0-9\-]+_', '', actual_file.name)
            download_tasks[task_id].update({
                "status": "completed",
                "percent": 100,
                "filename": clean_name,
                "filepath": str(actual_file),
                "title": info.get("title", f"{platform_info['name']} Media")
            })
        else:
            raise Exception("Downloaded media file not found on disk")

    except Exception as e:
        logger.exception("Download failed")
        download_tasks[task_id].update({
            "status": "error",
            "error": str(e)
        })

def cleanup_old_files():
    """Removes download files older than 30 minutes to conserve disk space without interrupting active downloads."""
    now = time.time()
    try:
        for f in DOWNLOADS_DIR.glob("*"):
            if f.is_file() and (now - f.stat().st_mtime > 1800):
                f.unlink(missing_ok=True)
    except Exception as e:
        logger.debug(f"Cleanup error: {e}")

@app.post("/api/start-download")
async def start_download(req: DownloadRequest, background_tasks: BackgroundTasks):
    task_id = str(uuid.uuid4())
    download_tasks[task_id] = {
        "status": "starting",
        "percent": 0.0,
        "speed": "0 KB/s",
        "eta": "Starting...",
        "filename": None,
        "filepath": None,
        "error": None
    }

    background_tasks.add_task(cleanup_old_files)
    background_tasks.add_task(run_download_task, task_id, req)
    return {"task_id": task_id}

@app.get("/api/progress/{task_id}")
async def get_progress(task_id: str):
    task = download_tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.get("/api/get-file/{task_id}")
async def get_file(task_id: str):
    task = download_tasks.get(task_id)
    if not task or task.get("status") != "completed":
        raise HTTPException(status_code=400, detail="File is not ready or does not exist")

    filepath = task.get("filepath")
    if not filepath or not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found on server")

    clean_name = re.sub(r'^[a-f0-9\-]+_', '', os.path.basename(filepath))
    safe_filename = re.sub(r'[\\/*?:"<>|]', "", clean_name).strip() or "media_download.mp4"

    # Precise mime type for mobile (iOS Safari/Android) and desktop media players
    lower = safe_filename.lower()
    if lower.endswith(".mp4"):
        media_type = "video/mp4"
    elif lower.endswith(".webm"):
        media_type = "video/webm"
    elif lower.endswith(".mp3"):
        media_type = "audio/mpeg"
    elif lower.endswith(".m4a"):
        media_type = "audio/mp4"
    elif lower.endswith(".wav"):
        media_type = "audio/wav"
    else:
        media_type = "application/octet-stream"

    from urllib.parse import quote
    encoded_filename = quote(safe_filename)
    ascii_fallback = safe_filename.encode("ascii", "ignore").decode("ascii").strip() or "download.mp4"

    headers = {
        "Content-Disposition": f'attachment; filename="{ascii_fallback}"; filename*=UTF-8\'\'{encoded_filename}',
        "Access-Control-Expose-Headers": "Content-Disposition",
        "Cache-Control": "public, max-age=3600"
    }

    return FileResponse(
        path=filepath,
        filename=safe_filename,
        media_type=media_type,
        headers=headers
    )

app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
