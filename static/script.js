// State management
let currentVideoData = null;
let currentFormatType = 'video';
let pollInterval = null;

// Platform detection patterns
const PLATFORMS = [
  { match: /(youtube\.com|youtu\.be)/i, id: 'youtube', name: 'YouTube', icon: 'fa-brands fa-youtube', color: '#ff334b' },
  { match: /(instagram\.com|instagr\.am)/i, id: 'instagram', name: 'Instagram Reel / Post', icon: 'fa-brands fa-instagram', color: '#e1306c' },
  { match: /(facebook\.com|fb\.watch|fb\.com|fb\.gg)/i, id: 'facebook', name: 'Facebook Video / Reel', icon: 'fa-brands fa-facebook', color: '#1877f2' },
  { match: /(tiktok\.com)/i, id: 'tiktok', name: 'TikTok Video', icon: 'fa-brands fa-tiktok', color: '#ff0050' },
  { match: /(twitter\.com|x\.com)/i, id: 'twitter', name: 'Twitter / X', icon: 'fa-brands fa-x-twitter', color: '#1da1f2' },
  { match: /(reddit\.com|redd\.it)/i, id: 'reddit', name: 'Reddit Video', icon: 'fa-brands fa-reddit', color: '#ff4500' },
  { match: /(pinterest\.com|pin\.it)/i, id: 'pinterest', name: 'Pinterest Media', icon: 'fa-brands fa-pinterest', color: '#bd081c' }
];

function identifyPlatform(url) {
  for (const p of PLATFORMS) {
    if (p.match.test(url)) return p;
  }
  return { id: 'generic', name: 'Web Media', icon: 'fa-solid fa-globe', color: '#a855f7' };
}

// Common Language Code to Friendly Name Mapping
const LANGUAGE_NAMES = {
  'en': 'English',
  'es': 'Spanish (Español)',
  'hi': 'Hindi (हिन्दी)',
  'fr': 'French (Français)',
  'de': 'German (Deutsch)',
  'ja': 'Japanese (日本語)',
  'ko': 'Korean (한국어)',
  'pt': 'Portuguese (Português)',
  'ru': 'Russian (Русский)',
  'zh': 'Chinese (中文)',
  'ar': 'Arabic (العربية)',
  'it': 'Italian (Italiano)',
  'tr': 'Turkish (Türkçe)',
  'id': 'Indonesian (Bahasa Indonesia)',
  'vi': 'Vietnamese (Tiếng Việt)',
  'bn': 'Bengali (বাংলা)',
  'ta': 'Tamil (தமிழ்)',
  'te': 'Telugu (తెలుగు)',
  'mr': 'Marathi (मराठी)',
  'ur': 'Urdu (اردو)',
  'nl': 'Dutch (Nederlands)',
  'pl': 'Polish (Polski)',
  'sv': 'Swedish (Svenska)'
};

function getLanguageDisplayName(code) {
  if (!code) return 'Default / Original';
  const cleanCode = code.toLowerCase().split('-')[0];
  return LANGUAGE_NAMES[cleanCode] || `Language (${code.toUpperCase()})`;
}

// DOM Elements
const videoUrlInput = document.getElementById('videoUrl');
const pasteBtn = document.getElementById('pasteBtn');
const clearBtn = document.getElementById('clearBtn');
const fetchBtn = document.getElementById('fetchBtn');
const resultSection = document.getElementById('resultSection');

const detectedPlatformBadge = document.getElementById('detectedPlatformBadge');
const detectedIcon = document.getElementById('detectedIcon');
const detectedName = document.getElementById('detectedName');

const videoThumb = document.getElementById('videoThumb');
const videoDuration = document.getElementById('videoDuration');
const videoTitle = document.getElementById('videoTitle');
const videoChannel = document.getElementById('videoChannel');
const videoViews = document.getElementById('videoViews');
const videoDesc = document.getElementById('videoDesc');

const mediaPlatformTag = document.getElementById('mediaPlatformTag');
const mediaPlatformIcon = document.getElementById('mediaPlatformIcon');
const mediaPlatformText = document.getElementById('mediaPlatformText');

const tabBtns = document.querySelectorAll('.tab-btn');
const qualitySelect = document.getElementById('qualitySelect');
const containerSelect = document.getElementById('containerSelect');
const languageSelect = document.getElementById('languageSelect');
const subtitleSelect = document.getElementById('subtitleSelect');
const languageGroup = document.getElementById('languageGroup');
const subtitleGroup = document.getElementById('subtitleGroup');

const downloadBtn = document.getElementById('downloadBtn');
const downloadBtnText = document.getElementById('downloadBtnText');
const progressSection = document.getElementById('progressSection');
const progressStatusText = document.getElementById('progressStatusText');
const progressPercent = document.getElementById('progressPercent');
const progressBar = document.getElementById('progressBar');
const progressSpeed = document.getElementById('progressSpeed');
const progressEta = document.getElementById('progressEta');
const readyBox = document.getElementById('readyBox');
const readyTitle = document.getElementById('readyTitle');
const readySubtitle = document.getElementById('readySubtitle');
const saveFileBtn = document.getElementById('saveFileBtn');
const saveFileText = document.getElementById('saveFileText');

// Cookie Modal Elements
const cookieBtn = document.getElementById('cookieBtn');
const cookieBtnText = document.getElementById('cookieBtnText');
const cookieModal = document.getElementById('cookieModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cookieFileInput = document.getElementById('cookieFileInput');
const cookieTextArea = document.getElementById('cookieTextArea');
const saveCookiesBtn = document.getElementById('saveCookiesBtn');
const deleteCookiesBtn = document.getElementById('deleteCookiesBtn');

const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const toastIcon = document.getElementById('toastIcon');

// Notification helper
function showToast(message, type = 'info') {
  toastMessage.textContent = message;
  toast.className = `toast toast-${type}`;
  toastIcon.className = type === 'error' ? 'fa-solid fa-triangle-exclamation' : 
                        type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-info';
  
  toast.classList.remove('hidden');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 5000);
}

// Cookie Status & Modal Handlers
async function checkCookieStatus() {
  try {
    const res = await fetch('/api/cookies-status');
    const data = await res.json();
    if (data.has_cookies) {
      cookieBtnText.textContent = 'Cookies: Active';
      cookieBtn.classList.add('cookie-active');
      deleteCookiesBtn.classList.remove('hidden');
    } else {
      cookieBtnText.textContent = 'Cookies: Not Set';
      cookieBtn.classList.remove('cookie-active');
      deleteCookiesBtn.classList.add('hidden');
    }
  } catch (err) {
    console.error('Failed to check cookie status', err);
  }
}

function openCookieModal() {
  cookieModal.classList.remove('hidden');
}

function closeCookieModal() {
  cookieModal.classList.add('hidden');
}

cookieBtn.addEventListener('click', openCookieModal);
closeModalBtn.addEventListener('click', closeCookieModal);
cookieModal.addEventListener('click', (e) => {
  if (e.target === cookieModal) closeCookieModal();
});

saveCookiesBtn.addEventListener('click', async () => {
  const file = cookieFileInput.files[0];
  const text = cookieTextArea.value.trim();

  if (file) {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload-cookies', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Upload failed');
      showToast('Cookies file uploaded successfully!', 'success');
      cookieFileInput.value = '';
      closeCookieModal();
      checkCookieStatus();
    } catch (e) {
      showToast(e.message, 'error');
    }
  } else if (text) {
    try {
      const res = await fetch('/api/save-cookies-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Saving cookies failed');
      showToast('Cookies text saved successfully!', 'success');
      cookieTextArea.value = '';
      closeCookieModal();
      checkCookieStatus();
    } catch (e) {
      showToast(e.message, 'error');
    }
  } else {
    showToast('Please select a cookies.txt file or paste cookies content', 'info');
  }
});

deleteCookiesBtn.addEventListener('click', async () => {
  try {
    const res = await fetch('/api/delete-cookies', { method: 'DELETE' });
    const data = await res.json();
    showToast('Cookies deleted', 'info');
    closeCookieModal();
    checkCookieStatus();
  } catch (e) {
    showToast('Failed to delete cookies', 'error');
  }
});

// Dynamic URL input detection
function handleUrlChange() {
  const val = videoUrlInput.value.trim();
  if (val.length > 0) {
    clearBtn.classList.remove('hidden');
    if (val.startsWith('http://') || val.startsWith('https://')) {
      const platform = identifyPlatform(val);
      detectedName.textContent = platform.name;
      detectedIcon.className = platform.icon;
      detectedPlatformBadge.style.color = platform.color;
      detectedPlatformBadge.style.borderColor = platform.color + '55';
      detectedPlatformBadge.style.background = platform.color + '15';
      detectedPlatformBadge.classList.remove('hidden');
    } else {
      detectedPlatformBadge.classList.add('hidden');
    }
  } else {
    clearBtn.classList.add('hidden');
    detectedPlatformBadge.classList.add('hidden');
  }
}

videoUrlInput.addEventListener('input', handleUrlChange);

clearBtn.addEventListener('click', () => {
  videoUrlInput.value = '';
  clearBtn.classList.add('hidden');
  detectedPlatformBadge.classList.add('hidden');
  videoUrlInput.focus();
});

pasteBtn.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      videoUrlInput.value = text.trim();
      handleUrlChange();
      fetchVideoInfo();
    }
  } catch (err) {
    showToast('Clipboard access denied. Please paste manually.', 'info');
  }
});

videoUrlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    fetchVideoInfo();
  }
});

fetchBtn.addEventListener('click', fetchVideoInfo);

// Fetch video/reel details
async function fetchVideoInfo() {
  const url = videoUrlInput.value.trim();
  if (!url) {
    showToast('Please enter a media link', 'error');
    videoUrlInput.focus();
    return;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    showToast('Please enter a valid link starting with http:// or https://', 'error');
    return;
  }

  fetchBtn.disabled = true;
  fetchBtn.querySelector('.btn-text').textContent = 'Analyzing...';
  fetchBtn.querySelector('.spinner').classList.remove('hidden');
  fetchBtn.querySelector('.fa-arrow-right').classList.add('hidden');
  resultSection.classList.add('hidden');
  progressSection.classList.add('hidden');

  try {
    const response = await fetch('/api/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.detail || 'Failed to retrieve media details';
      if (errMsg.toLowerCase().includes('cookies') || errMsg.toLowerCase().includes('login') || errMsg.toLowerCase().includes('bot')) {
        openCookieModal();
      }
      throw new Error(errMsg);
    }

    currentVideoData = data;
    renderVideoDetails(data);
    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth' });
    showToast(`${data.platform?.name || 'Media'} ready for download!`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    fetchBtn.disabled = false;
    fetchBtn.querySelector('.btn-text').textContent = 'Analyze';
    fetchBtn.querySelector('.spinner').classList.add('hidden');
    fetchBtn.querySelector('.fa-arrow-right').classList.remove('hidden');
  }
}

// Render video metadata and controls
function renderVideoDetails(data) {
  videoThumb.src = data.thumbnail || 'https://via.placeholder.com/640x360?text=No+Thumbnail';
  videoDuration.textContent = data.duration || '00:00';
  videoTitle.textContent = data.title;
  videoChannel.textContent = data.channel;
  videoViews.textContent = data.views !== '0' ? `${data.views} views` : 'Media Ready';
  videoDesc.textContent = data.description || '';

  // Set platform badge
  const platform = data.platform || identifyPlatform(videoUrlInput.value);
  mediaPlatformText.textContent = platform.name;
  mediaPlatformIcon.className = platform.icon;
  mediaPlatformTag.style.color = platform.color;

  // Multi-language handling
  languageSelect.innerHTML = '<option value="default">Default / Original Audio</option>';
  if (data.audio_languages && data.audio_languages.length > 0) {
    data.audio_languages.forEach(lang => {
      const opt = document.createElement('option');
      opt.value = lang;
      opt.textContent = getLanguageDisplayName(lang);
      languageSelect.appendChild(opt);
    });
    languageGroup.style.display = 'flex';
  } else {
    // If not YouTube or no multi-track audio, hide language selection
    languageGroup.style.display = 'none';
  }

  // Subtitles handling
  subtitleSelect.innerHTML = '<option value="none">None (No Subtitles)</option>';
  if (data.subtitles && data.subtitles.length > 0) {
    data.subtitles.forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub;
      opt.textContent = getLanguageDisplayName(sub);
      subtitleSelect.appendChild(opt);
    });
    subtitleGroup.style.display = 'flex';
  } else {
    subtitleGroup.style.display = 'none';
  }

  // Refresh Format and Container Dropdowns
  updateFormatOptions();
}

// Format Tab Switches (Video vs Audio)
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFormatType = btn.dataset.type;
    updateFormatOptions();
  });
});

function updateFormatOptions() {
  qualitySelect.innerHTML = '';
  containerSelect.innerHTML = '';

  if (currentFormatType === 'video') {
    const resolutions = (currentVideoData && currentVideoData.resolutions && currentVideoData.resolutions.length > 0)
      ? currentVideoData.resolutions
      : ['best', 'HD', 'SD'];

    resolutions.forEach(res => {
      const opt = document.createElement('option');
      opt.value = res;
      opt.textContent = res === 'best' ? 'Best Quality (Original)' : 
                        res.includes('p') ? `${res} HD / Standard` : `${res} Quality`;
      qualitySelect.appendChild(opt);
    });

    const containers = [
      { ext: 'mp4', name: 'MP4 (Universal & High Compatibility)' },
      { ext: 'webm', name: 'WEBM (Web Optimized)' }
    ];
    containers.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.ext;
      opt.textContent = c.name;
      containerSelect.appendChild(opt);
    });
  } else {
    const bitrates = [
      { val: '320', name: '320 kbps (Studio High Fidelity)' },
      { val: '192', name: '192 kbps (Standard Quality)' },
      { val: '128', name: '128 kbps (Compact Audio)' }
    ];
    bitrates.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.val;
      opt.textContent = b.name;
      qualitySelect.appendChild(opt);
    });

    const audioFormats = [
      { ext: 'mp3', name: 'MP3 Audio' },
      { ext: 'm4a', name: 'M4A / AAC Audio' },
      { ext: 'wav', name: 'WAV Lossless' }
    ];
    audioFormats.forEach(a => {
      const opt = document.createElement('option');
      opt.value = a.ext;
      opt.textContent = a.name;
      containerSelect.appendChild(opt);
    });
  }
}

// Track downloaded tasks to strictly prevent duplicate automatic downloads
const downloadedTaskIds = new Set();

function triggerDirectDownload(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  if (filename) {
    link.download = filename;
  }
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    try {
      document.body.removeChild(link);
    } catch (_) {}
  }, 1500);
}

// Start Download Request
downloadBtn.addEventListener('click', async () => {
  const url = videoUrlInput.value.trim();
  if (!url) {
    showToast('Please enter a valid URL first', 'error');
    return;
  }

  const payload = {
    url,
    format_type: currentFormatType,
    quality: qualitySelect.value,
    container: containerSelect.value,
    audio_language: languageSelect.value === 'default' ? null : languageSelect.value,
    subtitle_language: subtitleSelect.value === 'none' ? null : subtitleSelect.value
  };

  downloadBtn.disabled = true;
  if (downloadBtnText) downloadBtnText.textContent = 'Preparing Download...';
  readyBox.classList.add('hidden');
  progressSection.classList.remove('hidden');
  progressSection.scrollIntoView({ behavior: 'smooth' });

  progressBar.style.width = '0%';
  progressPercent.textContent = '0%';
  progressStatusText.textContent = 'Contacting server...';
  progressSpeed.textContent = '0 MB/s';
  progressEta.textContent = 'Starting...';

  try {
    const res = await fetch('/api/start-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Could not initiate download');
    }

    trackProgress(data.task_id);
  } catch (err) {
    downloadBtn.disabled = false;
    if (downloadBtnText) downloadBtnText.textContent = 'Download to Phone / Laptop';
    showToast(err.message, 'error');
    progressStatusText.textContent = 'Error occurred';
  }
});

// Track download progress via polling
function trackProgress(taskId) {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }

  pollInterval = setInterval(async () => {
    try {
      const res = await fetch(`/api/progress/${taskId}`);
      if (!res.ok) {
        clearInterval(pollInterval);
        pollInterval = null;
        throw new Error('Task lost or expired');
      }

      const task = await res.json();

      if (task.status === 'downloading') {
        const percent = Math.min(task.percent || 0, 99);
        progressBar.style.width = `${percent}%`;
        progressPercent.textContent = `${percent}%`;
        progressStatusText.textContent = 'Downloading media from source...';
        progressSpeed.textContent = task.speed || 'Calculating...';
        progressEta.textContent = task.eta || 'Calculating...';
      } else if (task.status === 'processing') {
        progressBar.style.width = '99%';
        progressPercent.textContent = '99%';
        progressStatusText.textContent = 'Muxing & converting audio/video tracks...';
        progressSpeed.textContent = 'Processing';
        progressEta.textContent = 'Almost ready';
      } else if (task.status === 'completed') {
        clearInterval(pollInterval);
        pollInterval = null;

        progressBar.style.width = '100%';
        progressPercent.textContent = '100%';
        progressStatusText.textContent = 'Ready! Saved to your device.';
        progressSpeed.textContent = 'Done';
        progressEta.textContent = '0s';

        downloadBtn.disabled = false;
        if (downloadBtnText) downloadBtnText.textContent = 'Download to Phone / Laptop';

        const downloadUrl = `/api/get-file/${taskId}`;
        saveFileBtn.href = downloadUrl;
        if (task.filename) {
          saveFileBtn.setAttribute('download', task.filename);
        }

        // Trigger direct download to Phone or Laptop EXACTLY ONCE
        if (!downloadedTaskIds.has(taskId)) {
          downloadedTaskIds.add(taskId);
          triggerDirectDownload(downloadUrl, task.filename);
          showToast('✅ Downloaded directly into your phone/laptop Downloads section!', 'success');
        }

        // Show confirmation that file was saved to device
        readyBox.classList.remove('hidden');
        if (readyTitle) readyTitle.textContent = 'Saved directly to your device!';
        if (readySubtitle) {
          const displayTitle = task.filename || (currentVideoData ? currentVideoData.title : 'media file');
          readySubtitle.innerHTML = `File <strong>${displayTitle}</strong> is in your phone/laptop <strong>Downloads</strong> section.`;
        }
        if (saveFileText) saveFileText.textContent = 'Download Again';

      } else if (task.status === 'error') {
        clearInterval(pollInterval);
        pollInterval = null;
        downloadBtn.disabled = false;
        if (downloadBtnText) downloadBtnText.textContent = 'Download to Phone / Laptop';
        progressStatusText.textContent = 'Failed';
        showToast(`Download failed: ${task.error}`, 'error');
        if (task.error && (task.error.toLowerCase().includes('login') || task.error.toLowerCase().includes('cookies'))) {
          openCookieModal();
        }
      }
    } catch (e) {
      clearInterval(pollInterval);
      pollInterval = null;
      downloadBtn.disabled = false;
      if (downloadBtnText) downloadBtnText.textContent = 'Download to Phone / Laptop';
      showToast(e.message, 'error');
    }
  }, 1000);
}

// Re-download button handler with debounce lock to prevent accidental multi-clicks
saveFileBtn.addEventListener('click', (e) => {
  if (saveFileBtn.dataset.busy === 'true') {
    e.preventDefault();
    return;
  }
  saveFileBtn.dataset.busy = 'true';
  saveFileBtn.style.opacity = '0.6';
  showToast('Re-downloading file...', 'info');
  setTimeout(() => {
    saveFileBtn.dataset.busy = 'false';
    saveFileBtn.style.opacity = '1';
  }, 3000);
});

// Check initial cookies status on page load
checkCookieStatus();
