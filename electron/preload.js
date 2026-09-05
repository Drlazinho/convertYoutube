const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getInfo: (url) => ipcRenderer.invoke('get-info', url),
  openPreviewWindow: (url) => ipcRenderer.invoke('open-preview-window', url),
  showInFolder: (filePath) => ipcRenderer.invoke('show-in-folder', filePath),
  getStreamUrl: (url) => ipcRenderer.invoke('get-stream-url', url),
  convert: (options) => ipcRenderer.invoke('start-conversion', options),
  searchYoutube: (query) => ipcRenderer.invoke('search-youtube', query),
  
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (config) => ipcRenderer.invoke('save-settings', config),
  chooseDirectory: () => ipcRenderer.invoke('choose-directory'),

  onProgress: (jobId, callback) => {
    const channel = `progress-${jobId}`;
    const listener = (event, data) => callback(data);
    ipcRenderer.on(channel, listener);
    
    // Return a cleanup function
    return () => {
      ipcRenderer.removeListener(channel, listener);
    };
  }
});
