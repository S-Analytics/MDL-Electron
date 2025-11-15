"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
let mainWindow = null;
let serverInstance = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
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
    }
    else {
        // In production, attempt to start the bundled server (exports.server)
        try {
            // Require the built server. At runtime this will resolve to dist/index.js
            // which exports `server` (the returned http.Server).
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const appModule = require(path.join(__dirname, '..', 'index'));
            if (appModule && appModule.server && !serverInstance) {
                serverInstance = appModule.server;
            }
        }
        catch (err) {
            // It's fine if there's no bundled server; we'll try to load an index.html
            // next which should be bundled in the `dist` directory.
            // console.warn('Could not start bundled server:', err);
        }
        mainWindow.loadFile(indexPath).catch((err) => {
            console.error('Failed to load file:', err);
        });
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (serverInstance && typeof serverInstance.close === 'function') {
            try {
                serverInstance.close();
            }
            catch (e) {
                // ignore
            }
        }
        electron_1.app.quit();
    }
});
//# sourceMappingURL=main.js.map