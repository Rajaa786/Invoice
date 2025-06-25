const { app, BrowserWindow, protocol, ipcMain } = require("electron");
require('dotenv').config();
const { autoUpdater } = require("electron-updater");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { registerItemDashboardIpc } = require("./ipc/itemDashboard");
const { registerCompanyDashboardIpc } = require("./ipc/companyDashboard");
const { registerCustomerDashboardIpc } = require("./ipc/customerDashboard");
const { registerTallyIpc } = require("./ipc/tallyHandlers.js");
const log = require("electron-log");
const { registerAnalyticsDashboardIpc } = require("./ipc/analyticsDashboard");
const { registerMigrationIpc } = require("./ipc/migrationRunner");
const settings = require('electron-settings');

// Configure electron-log
log.transports.console.level = "debug"; // Set the log level
log.transports.file.level = "info"; // Only log info level and above in the log file
const {
  registerInvoiceGeneratorIpc,
  registerInvoiceItemsIpc,
} = require("./ipc/invoiceGenerator");

// Create logs directory
const logDir = path.join(app.getPath("userData"), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create tmp directory for storing images
const tmpDir = path.join(__dirname, "tmp");
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
  console.log(`Created tmp directory at: ${tmpDir}`);
} else {
  console.log(`Tmp directory already exists at: ${tmpDir}`);
}

// Create log file stream
const logStream = fs.createWriteStream(path.join(logDir, "main.log"), {
  flags: "a",
});

// Redirect console.log to file
const originalConsoleLog = console.log;
console.log = function (...args) {
  originalConsoleLog(...args);
  logStream.write(`[${new Date().toISOString()}] ${args.join(" ")}\n`);
};

// Redirect console.error to file
const originalConsoleError = console.error;
console.error = function (...args) {
  originalConsoleError(...args);
  logStream.write(`[${new Date().toISOString()}] ERROR: ${args.join(" ")}\n`);
};

let mainWindow = null;

const isDev = process.env.NODE_ENV === "development";
console.log("process.env.NODE_ENV", process.env.NODE_ENV);

function createProtocol() {
  protocol.registerFileProtocol("app", (request, callback) => {
    const url = request.url.replace("app://", "");
    try {
      return callback(path.normalize(`${__dirname}/../react-app/build/${url}`));
    } catch (error) {
      console.error("Protocol error:", error);
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1800,
    height: 1000,
    simpleFullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "./assets/cyphersol-icon.png"),
    autoHideMenuBar: true,
    title: "CypherSol",
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
  } else {
    const prodPath = path.resolve(
      __dirname,
      "..",
      "react-app",
      "build",
      "index.html"
    );
    console.log("Production path:", prodPath);
    mainWindow.loadFile(prodPath).catch((err) => {
      console.error("Failed to load production build:", err);
    });
  }

  if (isDev) {
    // mainWindow.webContents.openDevTools();
  }

  console.log("Registering IPC handlers...");
  registerItemDashboardIpc();
  registerCompanyDashboardIpc();
  registerCustomerDashboardIpc();
  registerTallyIpc();
  registerInvoiceGeneratorIpc();
  registerInvoiceItemsIpc();
  registerAnalyticsDashboardIpc();
  registerMigrationIpc();

  // Register zoom level monitoring
  registerZoomMonitoring();

  // Configure electron-settings
  settings.configure({
    dir: path.join(app.getPath('userData'), 'Settings'),
    atomicSaving: true,
    numBackups: 3,
    prettify: true
  });

  // Add settings IPC handlers after other IPC handlers
  ipcMain.handle('settings:get', async (event, keyPath) => {
    try {
      return await settings.get(keyPath);
    } catch (error) {
      console.error('Error getting setting:', error);
      return undefined;
    }
  });

  ipcMain.handle('settings:set', async (event, keyPath, value) => {
    try {
      await settings.set(keyPath, value);
      return true;
    } catch (error) {
      console.error('Error setting value:', error);
      return false;
    }
  });

  ipcMain.handle('settings:has', async (event, keyPath) => {
    try {
      return await settings.has(keyPath);
    } catch (error) {
      console.error('Error checking setting:', error);
      return false;
    }
  });

  ipcMain.handle('settings:reset', async (event, keyPath = null) => {
    try {
      if (keyPath) {
        await settings.unset(keyPath);
      } else {
        await settings.clear();
      }
      return true;
    } catch (error) {
      console.error('Error resetting settings:', error);
      return false;
    }
  });

  ipcMain.handle('settings:export', async (event) => {
    try {
      const allSettings = await settings.getAll();
      return allSettings;
    } catch (error) {
      console.error('Error exporting settings:', error);
      return null;
    }
  });

  ipcMain.handle('settings:import', async (event, settingsData) => {
    try {
      // Clear existing settings first
      await settings.clear();

      // Import new settings
      for (const [key, value] of Object.entries(settingsData)) {
        await settings.set(key, value);
      }

      return true;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  });

  ipcMain.handle('settings:getAll', async (event) => {
    try {
      return await settings.getAll();
    } catch (error) {
      console.error('Error getting all settings:', error);
      return {};
    }
  });

  console.log("IPC handlers registered");
}

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

app.whenReady().then(() => {
  createProtocol();
  createWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Zoom level monitoring function
function registerZoomMonitoring() {
  // Handle zoom level requests
  ipcMain.handle('get-zoom-level', async () => {
    if (mainWindow) {
      const zoomLevel = mainWindow.webContents.getZoomLevel();
      const zoomFactor = mainWindow.webContents.getZoomFactor();
      console.log(`Current Zoom Level: ${zoomLevel}, Zoom Factor: ${zoomFactor.toFixed(2)}x`);
      return { zoomLevel, zoomFactor };
    }
    return { zoomLevel: 0, zoomFactor: 1 };
  });

  // Handle zoom level changes
  ipcMain.handle('set-zoom-level', async (event, level) => {
    if (mainWindow) {
      mainWindow.webContents.setZoomLevel(level);
      const zoomFactor = mainWindow.webContents.getZoomFactor();
      console.log(`Zoom Level set to: ${level}, Zoom Factor: ${zoomFactor.toFixed(2)}x`);
      return { zoomLevel: level, zoomFactor };
    }
    return { zoomLevel: 0, zoomFactor: 1 };
  });

  // Monitor zoom changes (this will catch Ctrl+/- shortcuts)
  if (mainWindow) {
    mainWindow.webContents.on('zoom-changed', (event, zoomDirection) => {
      const zoomLevel = mainWindow.webContents.getZoomLevel();
      const zoomFactor = mainWindow.webContents.getZoomFactor();
      console.log(`🔍 ZOOM CHANGED: Direction: ${zoomDirection}, Level: ${zoomLevel}, Factor: ${zoomFactor.toFixed(2)}x (${Math.round(zoomFactor * 100)}%)`);

      // Send zoom update to renderer process
      mainWindow.webContents.send('zoom-level-updated', {
        zoomLevel,
        zoomFactor,
        percentage: Math.round(zoomFactor * 100),
        direction: zoomDirection
      });
    });

    // Also monitor when zoom level is set programmatically
    const originalSetZoomLevel = mainWindow.webContents.setZoomLevel;
    mainWindow.webContents.setZoomLevel = function (level) {
      originalSetZoomLevel.call(this, level);
      setTimeout(() => {
        const zoomLevel = this.getZoomLevel();
        const zoomFactor = this.getZoomFactor();
        console.log(`🔍 ZOOM SET PROGRAMMATICALLY: Level: ${zoomLevel}, Factor: ${zoomFactor.toFixed(2)}x (${Math.round(zoomFactor * 100)}%)`);

        mainWindow.webContents.send('zoom-level-updated', {
          zoomLevel,
          zoomFactor,
          percentage: Math.round(zoomFactor * 100),
          direction: 'programmatic'
        });
      }, 10);
    };

    // Log initial zoom level
    setTimeout(() => {
      const zoomLevel = mainWindow.webContents.getZoomLevel();
      const zoomFactor = mainWindow.webContents.getZoomFactor();
      console.log(`🔍 INITIAL ZOOM: Level: ${zoomLevel}, Factor: ${zoomFactor.toFixed(2)}x (${Math.round(zoomFactor * 100)}%)`);
    }, 1000);
  }
}

// Export the tmp directory path for use in other files
module.exports = { tmpDir };
