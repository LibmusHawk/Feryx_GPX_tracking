const { contextBridge, ipcRenderer } = require('electron');
console.log('Preload script loaded');

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld('api', {
  register: async (username, password) => {
    console.log('Register function', username);
    return ipcRenderer.invoke('register', username, password);
  },
  login: async (username, password) => {
    console.log('Login function', username);
    return ipcRenderer.invoke('login', username, password);
  },
  showDialog: async ({ type, title, message }) => {
    console.log('Dialog function', { type, title, message });
    return ipcRenderer.invoke('show-dialog', { type, title, message });
  },
  invoke: (channel, data) => {
    return ipcRenderer.invoke(channel, data);
}
});
