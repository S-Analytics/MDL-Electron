import { app, BrowserWindow } from 'electron';
import type { Server } from 'http';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;
let serverInstance: Server | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const indexPath = path.join(__dirname, '..', 'index.html');

  // If running in development (no packaged index.html), load local server
  if (process.env.ELECTRON_DEV === 'true') {
    const port = process.env.PORT || '3000';
    mainWindow.loadURL(`http://localhost:${port}`);
  } else {
  // In production, attempt to start the bundled server (exports.server)
    try {
      // Require the built server. At runtime this will resolve to dist/index.js
      // which exports `server` (the returned http.Server).
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const appModule = require(path.join(__dirname, '..', 'index'));
      if (appModule && appModule.server && !serverInstance) {
        serverInstance = appModule.server as Server;
      }
    } catch (err) {
      // It's fine if there's no bundled server; we'll try to load an index.html
      // next which should be bundled in the `dist` directory.
      // console.warn('Could not start bundled server:', err);
    }

    // If we've started a bundled server, load the local server URL so the
    // dynamic dashboard and API work as expected. Otherwise fall back to a
    // static index.html if present in the packaged app.
    if (serverInstance) {
      const port = process.env.PORT || '3000';
      mainWindow.loadURL(`http://localhost:${port}`);
    } else {
      mainWindow.loadFile(indexPath).catch((err) => {
        console.error('Failed to load file:', err);
      });
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverInstance && typeof serverInstance.close === 'function') {
      try {
        serverInstance.close();
      } catch (e) {
        // ignore
      }
    }
    app.quit();
  }
});
