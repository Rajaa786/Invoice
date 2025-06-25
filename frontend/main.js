const { app, BrowserWindow, protocol, ipcMain, dialog } = require("electron");
require('dotenv').config();
const { autoUpdater } = require("electron-updater");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { registerItemDashboardIpc } = require("./ipc/itemDashboard");
const { registerCompanyDashboardIpc } = require("./ipc/companyDashboard");
const { registerCustomerDashboardIpc } = require("./ipc/customerDashboard");
const { registerTallyIpc } = require("./ipc/tallyHandlers.js");
const { registerInvoiceGeneratorIpc, registerInvoiceItemsIpc } = require("./ipc/invoiceGenerator");
const log = require("electron-log/main");
const { registerAnalyticsDashboardIpc } = require("./ipc/analyticsDashboard");
const { registerMigrationIpc } = require("./ipc/migrationRunner");
const settings = require('electron-settings');

// Utility function to detect development environment
const isDev = () => {
  // Method 1: Check NODE_ENV environment variable
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // Method 2: Check if we're running from source (not packaged)
  if (process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath)) {
    return true;
  }

  // Method 3: Check if app is packaged
  if (app.isPackaged === false) {
    return true;
  }

  // Method 4: Check for common development indicators
  if (process.argv.includes('--dev') || process.argv.includes('--development')) {
    return true;
  }

  // Default to production
  return false;
};

// Cache the result since it won't change during runtime
const isDevMode = isDev();

// Configure electron-log
log.initialize();
log.transports.file.level = 'debug';
log.transports.console.level = 'debug';
log.transports.file.maxSize = 10 * 1024 * 1024; // 10MB
log.transports.file.archiveLog = true;
log.transports.file.maxArchiveFiles = 5;

// Set log file location
log.transports.file.resolvePathFn = () => path.join(app.getPath('userData'), 'logs', 'main.log');

// Add timestamp format
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
log.transports.console.format = '[{h}:{i}:{s}.{ms}] [{level}] {text}';

log.info('='.repeat(80));
log.info('Application starting...');
log.info(`App version: ${app.getVersion()}`);
log.info(`Electron version: ${process.versions.electron}`);
log.info(`Node version: ${process.versions.node}`);
log.info(`Platform: ${process.platform} ${process.arch}`);
log.info(`Environment: ${isDevMode ? 'development' : 'production'}`);
log.debug(`Development mode detection:`);
log.debug(`  NODE_ENV: ${process.env.NODE_ENV}`);
log.debug(`  app.isPackaged: ${app.isPackaged}`);
log.debug(`  process.defaultApp: ${process.defaultApp}`);
log.debug(`  execPath: ${process.execPath}`);
log.info('='.repeat(80));

// Create tmp directory for storing images
const tmpDir = path.join(__dirname, "tmp");
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
  log.info(`Created tmp directory at: ${tmpDir}`);
} else {
  log.debug(`Tmp directory already exists at: ${tmpDir}`);
}

let mainWindow = null;

function createProtocol() {
  log.debug('Creating custom protocol handler for app://');
  protocol.registerFileProtocol("app", (request, callback) => {
    const url = request.url.replace("app://", "");
    try {
      const filePath = path.normalize(`${__dirname}/../react-app/build/${url}`);
      log.debug(`Protocol request: ${request.url} -> ${filePath}`);
      return callback(filePath);
    } catch (error) {
      log.error("Protocol error:", error);
    }
  });
}

function createWindow() {
  log.info('Creating main window...');

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

  log.info(`Window created with dimensions: 1800x1000`);

  if (isDevMode) {
    log.info('Loading development URL: http://localhost:3000');
    mainWindow.loadURL("http://localhost:3000");
  } else {
    const prodPath = path.resolve(
      __dirname,
      "..",
      "react-app",
      "build",
      "index.html"
    );
    log.info(`Loading production build from: ${prodPath}`);
    mainWindow.loadFile(prodPath).catch((err) => {
      log.error("Failed to load production build:", err);
    });
  }

  if (isDevMode) {
    log.debug('Development mode - DevTools available but not opened');
    // mainWindow.webContents.openDevTools();
  }

  log.info("Registering IPC handlers...");
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
  log.info("All IPC handlers registered successfully");

  // Configure electron-settings
  const settingsDir = path.join(app.getPath('userData'), 'Settings');
  log.info(`Configuring electron-settings with directory: ${settingsDir}`);
  settings.configure({
    dir: settingsDir,
    atomicSaving: true,
    numBackups: 3,
    prettify: true
  });
  log.info("Electron-settings configured successfully");

  // Add settings IPC handlers after other IPC handlers
  log.info("Registering settings IPC handlers...");

  ipcMain.handle('settings:get', async (event, keyPath) => {
    try {
      log.debug(`Getting setting: ${keyPath}`);
      const value = await settings.get(keyPath);
      log.debug(`Retrieved setting ${keyPath}:`, value);
      return value;
    } catch (error) {
      log.error(`Error getting setting ${keyPath}:`, error);
      return undefined;
    }
  });

  ipcMain.handle('settings:set', async (event, keyPath, value) => {
    try {
      log.debug(`Setting ${keyPath} to:`, value);
      await settings.set(keyPath, value);
      log.info(`Successfully set ${keyPath}`);
      return true;
    } catch (error) {
      log.error(`Error setting ${keyPath}:`, error);
      return false;
    }
  });

  ipcMain.handle('settings:has', async (event, keyPath) => {
    try {
      log.debug(`Checking if setting exists: ${keyPath}`);
      const exists = await settings.has(keyPath);
      log.debug(`Setting ${keyPath} exists: ${exists}`);
      return exists;
    } catch (error) {
      log.error(`Error checking setting ${keyPath}:`, error);
      return false;
    }
  });

  ipcMain.handle('settings:reset', async (event, keyPath = null) => {
    try {
      if (keyPath) {
        log.info(`Resetting setting: ${keyPath}`);
        await settings.unset(keyPath);
        log.info(`Successfully reset setting: ${keyPath}`);
      } else {
        log.warn('Clearing all settings');
        await settings.clear();
        log.info('Successfully cleared all settings');
      }
      return true;
    } catch (error) {
      log.error(`Error resetting settings (keyPath: ${keyPath}):`, error);
      return false;
    }
  });

  ipcMain.handle('settings:export', async (event) => {
    try {
      log.info('Exporting all settings');
      const allSettings = await settings.getAll();
      const settingsCount = Object.keys(allSettings).length;
      log.info(`Successfully exported ${settingsCount} settings`);
      return allSettings;
    } catch (error) {
      log.error('Error exporting settings:', error);
      return null;
    }
  });

  ipcMain.handle('settings:import', async (event, settingsData) => {
    try {
      const settingsCount = Object.keys(settingsData).length;
      log.info(`Importing ${settingsCount} settings`);

      // Clear existing settings first
      await settings.clear();
      log.debug('Cleared existing settings');

      // Import new settings
      for (const [key, value] of Object.entries(settingsData)) {
        await settings.set(key, value);
        log.debug(`Imported setting: ${key}`);
      }

      log.info(`Successfully imported ${settingsCount} settings`);
      return true;
    } catch (error) {
      log.error('Error importing settings:', error);
      return false;
    }
  });

  ipcMain.handle('settings:getAll', async (event) => {
    try {
      log.debug('Getting all settings');
      const allSettings = await settings.getAll();
      const settingsCount = Object.keys(allSettings).length;
      log.debug(`Retrieved ${settingsCount} settings`);
      return allSettings;
    } catch (error) {
      log.error('Error getting all settings:', error);
      return {};
    }
  });

  log.info("Settings IPC handlers registered successfully");
}

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

app.whenReady().then(() => {
  log.info('App is ready, initializing...');
  createProtocol();
  createWindow();
  log.info('Application initialization complete');
});

app.on("window-all-closed", () => {
  log.info('All windows closed');
  if (process.platform !== 'darwin') {
    log.info('Quitting application');
    app.quit();
  }
});

app.on("activate", () => {
  log.info('App activated');
  if (BrowserWindow.getAllWindows().length === 0) {
    log.info('No windows open, creating new window');
    createWindow();
  }
});

app.on('before-quit', () => {
  log.info('Application is about to quit');
});

app.on('will-quit', () => {
  log.info('Application will quit');
});

app.on('quit', () => {
  log.info('Application has quit');
});

// Zoom level monitoring function
function registerZoomMonitoring() {
  log.info('Registering zoom level monitoring...');

  // Handle zoom level requests
  ipcMain.handle('get-zoom-level', async () => {
    if (mainWindow) {
      const zoomLevel = mainWindow.webContents.getZoomLevel();
      const zoomFactor = mainWindow.webContents.getZoomFactor();
      log.debug(`Current Zoom Level: ${zoomLevel}, Zoom Factor: ${zoomFactor.toFixed(2)}x`);
      return { zoomLevel, zoomFactor };
    }
    log.warn('No main window available for zoom level request');
    return { zoomLevel: 0, zoomFactor: 1 };
  });

  // Handle zoom level changes
  ipcMain.handle('set-zoom-level', async (event, level) => {
    if (mainWindow) {
      mainWindow.webContents.setZoomLevel(level);
      const zoomFactor = mainWindow.webContents.getZoomFactor();
      log.info(`Zoom Level set to: ${level}, Zoom Factor: ${zoomFactor.toFixed(2)}x`);
      return { zoomLevel: level, zoomFactor };
    }
    log.warn('No main window available for zoom level change');
    return { zoomLevel: 0, zoomFactor: 1 };
  });

  // Monitor zoom changes (this will catch Ctrl+/- shortcuts)
  if (mainWindow) {
    mainWindow.webContents.on('zoom-changed', (event, zoomDirection) => {
      const zoomLevel = mainWindow.webContents.getZoomLevel();
      const zoomFactor = mainWindow.webContents.getZoomFactor();
      log.info(`🔍 ZOOM CHANGED: Direction: ${zoomDirection}, Level: ${zoomLevel}, Factor: ${zoomFactor.toFixed(2)}x (${Math.round(zoomFactor * 100)}%)`);

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
        log.debug(`🔍 ZOOM SET PROGRAMMATICALLY: Level: ${zoomLevel}, Factor: ${zoomFactor.toFixed(2)}x (${Math.round(zoomFactor * 100)}%)`);

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
      log.info(`🔍 INITIAL ZOOM: Level: ${zoomLevel}, Factor: ${zoomFactor.toFixed(2)}x (${Math.round(zoomFactor * 100)}%)`);
    }, 1000);

    log.info('Zoom level monitoring configured successfully');
  } else {
    log.warn('No main window available for zoom monitoring setup');
  }
}

// Export the tmp directory path for use in other files
module.exports = { tmpDir };
