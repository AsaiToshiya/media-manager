const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require("fs");
const { exec } = require('child_process'); 
const sharp = require("sharp");

const isDev = process.env.NODE_ENV === 'development';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line global-require
if (require('electron-squirrel-startup')) {
  app.quit();
}

const getConfig = () => {
  const configPath = path.join(app.getPath("userData"), "config.json");
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
};

const getMediaPath = (...paths) => {
  const config = getConfig();
  return path.join(config.libraryPath, "medias", ...paths);
};

const getThumbsPath = () => {
  const config = getConfig();
  return path.join(config.libraryPath, "thumbnails");
};

const getUniqueFilename = (dir, originalName, count = 0) => {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const filename = count ? `${name} (${count})${ext}` : originalName;
  const filePath = path.join(dir, filename);
  return fs.existsSync(filePath)
    ? getUniqueFilename(dir, originalName, ++count)
    : filename;
};

const openCommand =
  {
    darwin: "open",
    win32: 'start ""',
    win64: 'start ""',
  }[process.platform] ?? "xdg-open";

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev,
    },
  });

  ipcMain.handle("getConfig", getConfig);
  ipcMain.handle("getMedias", (event, ...paths) => {
    const mediaPath = getMediaPath(...paths);
    return fs
      .readdirSync(mediaPath, { withFileTypes: true })
      .map((d) => ({ isFolder: d.isDirectory(), name: d.name }));
  });
  ipcMain.handle("importMedia", async (event, file) => {
    const config = getConfig();
    const filename = getUniqueFilename(getMediaPath(), path.basename(file));

    const mediaPath = path.join(getMediaPath(), filename);
    fs.copyFileSync(file, mediaPath);

    const thumbPath = path.join(getThumbsPath(), filename);
    await sharp(file)
      .resize(320, 320, { fit: sharp.fit.inside, withoutEnlargement: true })
      .toFile(thumbPath);
  });
  ipcMain.handle("openMedia", (event, key) => {
    const file = path.join(getMediaPath(), key);
    exec(`${openCommand} "${file}"`);
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  } else {
    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
const config = getConfig();
!fs.existsSync(config.libraryPath) ? fs.mkdirSync(config.libraryPath): undefined;
const mediaPath = getMediaPath();
!fs.existsSync(mediaPath) ? fs.mkdirSync(mediaPath): undefined;
const thumbPath = getThumbsPath();
!fs.existsSync(thumbPath) ? fs.mkdirSync(thumbPath): undefined;
