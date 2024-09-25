const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

ipcMain.on('download-video', (event, { url, quality }) => {
  const command = `yt-dlp -f "bestvideo[height<=${quality}]+bestaudio" --merge-output-format mp4 ${url} -o "downloads/%(title)s.%(ext)s"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      event.sender.send('download-status', `Error: ${error.message}`);
      return;
    }
    if (stderr) {
      event.sender.send('download-status', `Error: ${stderr}`);
      return;
    }
    event.sender.send('download-status', 'Download Complete!');
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
