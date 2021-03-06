const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const log = require('electron-log');
const {autoUpdater} = require('electron-updater');
const path = require('path');
const url = require('url');
const fs = require('fs');

var srdir =  require('os').homedir() + '/Documents/My Games/SWG - Sentinels Republic';

if (!fs.existsSync(srdir))
  fs.mkdirSync(srdir);

log.transports.file.file = srdir + '/SR-Launcher-log.txt';
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({width: 1130,
   height: 610,
   resizable: false,
   fullscreen: false,
   fullscreenable: false,
   maximizable: false,
   maxWidth: 1130,
   maxHeight: 610,
   transparent: true,
   show: false,
   autoHideMenuBar: true,
   frame: false,
   icon: path.join(__dirname, 'img/launcher-icon-64.png')
 });
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
  //if (require('electron-is-dev')) mainWindow.webContents.openDevTools();
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.once('closed', () => mainWindow = null);
}

app.on('ready', createWindow);
app.on('window-all-closed', () => app.quit());

ipcMain.on('open-directory-dialog', function (event, response) {
  dialog.showOpenDialog({
    properties: ['openDirectory']
  }, function (files) {
    if (files) event.sender.send(response, files[0])
  });
});

ipcMain.on('setup-game', function() {
  setupGame();
});

function setupGame() {
  setupWindow = new BrowserWindow({width: 810,
   height: 610,
   resizable: false,
   fullscreen: false,
   fullscreenable: false,
   maximizable: false,
   maxWidth: 810,
   maxHeight: 610,
   transparent: true,
   frame: false,
   autoHideMenuBar: true,
   icon: path.join(__dirname, 'img/installer-icon-64.png')
 });
  setupWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'setup', 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
}

ipcMain.on('setup-complete', (event, arg) => {
  mainWindow.webContents.send('setup-begin-install', arg);
});


ipcMain.on('open-profcalc', function() {
  window = new BrowserWindow({width: 1296, height: 839, autoHideMenuBar: true});
  window.loadURL(url.format({
    pathname: path.join(__dirname, 'profcalc', 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
  if (require('electron-is-dev')) window.webContents.openDevTools();
});

autoUpdater.on('update-downloaded', (info) => {
  autoUpdater.quitAndInstall();  
});

autoUpdater.on('download-progress', (progress) => {
  mainWindow.webContents.send('download-progress', progress);
})

autoUpdater.on('update-available', info => {
  mainWindow.webContents.send('downloading-update', 'Downloading version ' + info.version);
})

app.on('ready', function()  {
  if (!require('electron-is-dev'))
    autoUpdater.checkForUpdates();
});