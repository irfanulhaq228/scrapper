const { app, BrowserWindow } = require('electron');
const path = require('path');
const { startScraping } = require('./scrapping');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,  // for simplicity, but not recommended in production
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
  startScraping(); // Start puppeteer after window opens
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
