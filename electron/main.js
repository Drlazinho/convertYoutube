const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const os = require('os');
const { join } = require('path');
const { tmpdir } = require('os');
const { create } = require('youtube-dl-exec');
const crypto = require('crypto');

const isWin = os.platform() === 'win32';
const ytdlpBinary = isWin ? 'yt-dlp.exe' : 'yt-dlp';
const ffmpegBinary = isWin ? 'ffmpeg.exe' : 'ffmpeg';

const ytdlpPath = app.isPackaged
  ? path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', 'youtube-dl-exec', 'bin', ytdlpBinary)
  : path.join(__dirname, '../node_modules/youtube-dl-exec/bin', ytdlpBinary);

const youtubedl = create(ytdlpPath);

const ffmpegPath = app.isPackaged
  ? path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', 'ffmpeg-static', ffmpegBinary)
  : require('ffmpeg-static');
const serve = require('electron-serve').default || require('electron-serve');

const loadURL = serve({ directory: path.join(__dirname, '../out') });

let mainWindow;

// Emulate the jobs store
const jobs = new Map();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#08080a',
      symbolColor: '#ffffff',
      height: 40
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#08080a',
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    loadURL(mainWindow);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('get-info', async (event, url) => {
  try {
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      callHome: false,
      noCheckCertificates: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
      noPlaylist: true,
      extractorArgs: 'youtube:player_client=android,web',
    });

    const seconds = info.duration;
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    let duration = `${m}:${s}`;
    if (seconds >= 3600) {
      const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
      const mm = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
      duration = `${h}:${mm}:${s}`;
    }

    return {
      success: true,
      info: {
        id: info.id,
        title: info.title,
        channel: info.uploader,
        thumbnail: info.thumbnail,
        duration,
      }
    };
  } catch (error) {
    console.error('Error fetching info:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('start-conversion', async (event, { url, quality, title }) => {
  const jobId = crypto.randomUUID();
  
  // Sanitize title to be a valid file name (remove illegal characters)
  const safeTitle = (title || 'audio_youtube').replace(/[<>:"\/\\|?*\x00-\x1F]/g, '').trim();
  
  // Choose save location dialog
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Salvar Áudio',
    defaultPath: path.join(app.getPath('downloads'), `${safeTitle}.mp3`),
    filters: [
      { name: 'Audio MP3', extensions: ['mp3'] }
    ]
  });

  if (canceled || !filePath) {
    return { success: false, error: 'Download cancelado pelo usuário.' };
  }

  processJob(jobId, url, quality, filePath).catch(err => {
    console.error('Job background error:', err);
    mainWindow.webContents.send(`progress-${jobId}`, { status: 'error', error: err.message });
  });

  return { success: true, jobId };
});

async function processJob(jobId, url, quality, finalPath) {
  try {
    mainWindow.webContents.send(`progress-${jobId}`, { status: 'starting' });

    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      callHome: false,
      noCheckCertificates: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
      noPlaylist: true,
      extractorArgs: 'youtube:player_client=android,web',
    });

    const bitrate = quality === '192' ? '192' : '320';
    
    mainWindow.webContents.send(`progress-${jobId}`, { status: 'downloading', percent: 0 });

    const subprocess = youtubedl.exec(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      audioQuality: bitrate === '320' ? 0 : 5,
      output: finalPath,
      ffmpegLocation: ffmpegPath,
      noWarnings: true,
      callHome: false,
      noCheckCertificates: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
      noPlaylist: true,
      extractorArgs: 'youtube:player_client=android,web',
    });

    if (subprocess.stdout) {
      subprocess.stdout.on('data', (data) => {
        const text = data.toString();
        const match = text.match(/\[download\]\s+([\d\.]+)\%\s+of\s+~?([\d\.\w]+)\s+at\s+([\d\.\w\/]+)\s+ETA\s+([\d:]+)/);
        if (match) {
          const [, percent, size, speed, eta] = match;
          mainWindow.webContents.send(`progress-${jobId}`, {
            status: 'downloading',
            percent: parseFloat(percent),
            totalSize: size,
            speed,
            eta
          });
        } else if (text.includes('Extracting audio') || text.includes('Destination:') && text.includes('.mp3')) {
          mainWindow.webContents.send(`progress-${jobId}`, {
            status: 'processing',
            percent: 100
          });
        }
      });
    }

    await subprocess;

    mainWindow.webContents.send(`progress-${jobId}`, {
      status: 'done',
      percent: 100,
      filePath: finalPath
    });

  } catch (error) {
    console.error('Process Job Error:', error);
    mainWindow.webContents.send(`progress-${jobId}`, { status: 'error', error: error.message || 'Erro na conversão' });
  }
}
