const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs/promises');

const isDev = process.env.NODE_ENV !== 'production';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // Security best practice
      contextIsolation: true, // Required for preload script
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'public/favicon.ico'),
    autoHideMenuBar: true, // Hides the default electron menu bar
  });

  if (isDev) {
    // In dev mode, load the Next.js local server
    win.loadURL('http://localhost:3000');
    // Open the DevTools automatically in dev mode (optional)
    // win.webContents.openDevTools();
  } else {
    // In production, load the exported Next.js static files
    win.loadFile(path.join(__dirname, 'out/index.html'));
  }
}

// App lifecycle
app.whenReady().then(() => {
  // Setup IPC Handlers for Storage
  const userDataPath = app.getPath('userData');
  const saveFilePath = path.join(userDataPath, 'studychina_save.json');

  let saveQueue = Promise.resolve();

  ipcMain.handle('save-data', async (event, data) => {
    return new Promise((resolve) => {
      saveQueue = saveQueue.then(async () => {
        try {
          // Write to a temporary file first, then rename for atomic save (best practice)
          const tempPath = saveFilePath + '.tmp';
          await fs.writeFile(tempPath, data, 'utf8');
          await fs.rename(tempPath, saveFilePath);
          resolve({ success: true });
        } catch (error) {
          console.error('Failed to save data:', error);
          resolve({ success: false, error: error.message });
        }
      });
    });
  });

  ipcMain.handle('load-data', async () => {
    try {
      const data = await fs.readFile(saveFilePath, 'utf8');
      return { success: true, data };
    } catch (error) {
      // Return null data if file doesn't exist (first time play)
      if (error.code === 'ENOENT') return { success: true, data: null };
      console.error('Failed to load data:', error);
      return { success: false, error: error.message };
    }
  });

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
