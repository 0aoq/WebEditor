const electron = require('electron');
const path = require('path')
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1250,
        height: 850,
        webPreferences: {
            worldSafeExecuteJavaScript: true,
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            titleBarStyle: "hidden"
        }
    });
    mainWindow.loadURL(path.join(__dirname, 'app', 'index.html'));
    mainWindow.on('closed', function() {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function() {
    if (mainWindow === null) {
        createWindow();
    }
});