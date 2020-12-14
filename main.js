const {app, BrowserWindow, Menu} = require('electron');
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");
const aws4 = require('aws4')

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let win;

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
}
function createDefaultWindow() {
  win = new BrowserWindow();
  win.webContents.openDevTools();
  win.on('closed', () => {
    win = null;
  });
  win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
  return win;
}

autoUpdater.on('checking-for-update', () => {
  log.info('checking-for-update')

  const opts = {
    service: 's3',
    region: 'ap-northeast-1',
    method: 'GET',
    host: 'private-s3-electron-auto-updater-test.s3-ap-northeast-1.amazonaws.com',
    path: 'application/latest-mac.yml'
  }
  aws4.sign(opts, {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  })
  autoUpdater.requestHeaders = opts.headers
  log.info(opts)
  log.info(autoUpdater.requestHeaders)
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  log.info('update-available')
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  log.info('update-not-available')
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  log.info('update-downloaded')
  sendStatusToWindow('Update downloaded');
});
app.on('ready', function() {
  createDefaultWindow();
});
app.on('window-all-closed', () => {
  app.quit();
});

app.on('ready', function()  {
  autoUpdater.checkForUpdatesAndNotify();
});
