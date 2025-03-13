const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs').promises;
Menu.setApplicationMenu(false)
const sqlite3 = require('sqlite3').verbose();

let mainWindow;

// Connect to the SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the SQLite database.');
    // Create the users table if it doesn't exist :P
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )`
    );
  }
});

    // App Setup
app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, '../images/icons/feryx_logo_v3.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Preload script
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
    },
  });
  mainWindow.loadFile('./src/pages/login.html');
});


// Handle registration
ipcMain.handle('register', async (_, username, password) => {
  return new Promise((resolve) => {
    const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
    db.run(query, [username, password], (err) => {
      if (err) {
        console.error('Error during registration:', err.message);
        resolve({ success: false, message: 'Username already exists or invalid data.' });
      } else {
        resolve({ success: true });
      }
    });
  });
});

// Handle login
ipcMain.handle('login', async (_, username, password) => {
  return new Promise((resolve) => {
    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
    db.get(query, [username, password], (err, row) => {
      if (err) {
        console.error('Error during login:', err.message);
        resolve({ success: false });
      } else if (row) {
        resolve({ success: true });
      } else {
        resolve({ success: false, message: 'Invalid username or password.' });
      }
    });
  });
});

// Dialog requests
ipcMain.handle('show-dialog', async (_, { type, title, message }) => {
  return dialog.showMessageBox(mainWindow, {
    type: type || 'info',
    title: title || 'Message',
    message: message || '',
  });
});

  // Application cleanup
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

    // File saving
ipcMain.handle('save-file', async (event, args) => {
  const { defaultPath, filters, content } = args;
  
    // Save dialog
  const { filePath } = await dialog.showSaveDialog({
      defaultPath: defaultPath,
      filters: filters
  });
    // Writes file content
  if (filePath) {
      await fs.writeFile(filePath, content, 'utf8');
      return filePath;
  }
  
    // Save cancellation
  throw new Error('No file path selected');
});
