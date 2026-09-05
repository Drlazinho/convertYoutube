const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getInfo: (url) => ipcRenderer.invoke('get-info', url),
  convert: (options) => ipcRenderer.invoke('start-conversion', options),
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
