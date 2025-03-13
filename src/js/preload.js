const { contextBridge, ipcRenderer } = require('electron');
console.log('Preload script loaded');

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld('api', {
  register: (username, password) =>
    ipcRenderer.invoke('register', username, password),
  login: (username, password) =>
    ipcRenderer.invoke('login', username, password),
  showDialog: ({ type, title, message }) =>
    ipcRenderer.invoke('show-dialog', { type, title, message }),
  invoke: (channel, data) => {
    return ipcRenderer.invoke(channel, data);
}
});
