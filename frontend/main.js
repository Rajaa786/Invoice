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
const { registerFileHandlers } = require("./ipc/fileHandlers");
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

// Set log levels based on environment
const logLevel = isDevMode ? 'debug' : 'info';
log.transports.file.level = logLevel;
log.transports.console.level = logLevel;

// File transport configuration
log.transports.file.maxSize = 10 * 1024 * 1024; // 10MB
log.transports.file.archiveLog = true;
log.transports.file.maxArchiveFiles = 5;

// Create logs directory
const logsDir = path.join(app.getPath('userData'), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Set log file locations
log.transports.file.resolvePathFn = () => path.join(logsDir, 'main.log');

// Add timestamp format with component identification
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] [MAIN] {text}';
log.transports.console.format = '[{h}:{i}:{s}.{ms}] [{level}] [MAIN] {text}';

// Add template-specific log file for template system debugging
const templateLog = log.create('template');
templateLog.transports.file.resolvePathFn = () => path.join(logsDir, 'template-system.log');
templateLog.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] [TEMPLATE] {text}';
templateLog.transports.console.format = '[{h}:{i}:{s}.{ms}] [{level}] [TEMPLATE] {text}';
templateLog.transports.file.level = 'debug';
templateLog.transports.console.level = logLevel;

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
let settingsFile = null; // Global variable for settings file path

function createProtocol() {
  log.debug('Creating custom protocol handlers...');

  // App protocol for React app files
  protocol.registerFileProtocol("app", (request, callback) => {
    const url = request.url.replace("app://", "");
    try {
      const filePath = path.normalize(`${__dirname}/../react-app/build/${url}`);
      log.debug(`App protocol request: ${request.url} -> ${filePath}`);
      return callback(filePath);
    } catch (error) {
      log.error("App protocol error:", error);
    }
  });

  // Uploads protocol for file serving from user data directory
  protocol.registerFileProtocol("uploads", (request, callback) => {
    const url = request.url.replace("uploads://", "");
    try {
      const userDataPath = app.getPath('userData');
      const filePath = path.normalize(`${userDataPath}/uploads/${url}`);
      log.debug(`Uploads protocol request: ${request.url} -> ${filePath}`);
      return callback(filePath);
    } catch (error) {
      log.error("Uploads protocol error:", error);
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
  registerFileHandlers();

  // Register zoom level monitoring
  registerZoomMonitoring();
  log.info("All IPC handlers registered successfully");

  // Configure electron-settings
  const settingsDir = path.join(app.getPath('userData'), 'Settings');
  log.info(`Configuring electron-settings with directory: ${settingsDir}`);

  // Create settings directory if it doesn't exist
  if (!fs.existsSync(settingsDir)) {
    fs.mkdirSync(settingsDir, { recursive: true });
    log.info(`Created settings directory: ${settingsDir}`);
  }

  // Use a simpler settings file path
  settingsFile = path.join(settingsDir, 'settings.json');
  log.info(`Settings file path: ${settingsFile}`);

  settings.configure({
    fileName: 'settings.json',
    dir: settingsDir,
    atomicSaving: false, // Disable atomic saving to prevent EPERM errors on Windows
    numBackups: 0, // Disable backups to prevent file conflicts
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

      // Check for specific Windows permission errors
      if (error.code === 'EPERM') {
        log.error('Permission denied error - this might be due to:');
        log.error('1. Antivirus software blocking file access');
        log.error('2. Windows file permissions');
        log.error('3. File being locked by another process');
        log.error(`Settings file path: ${settingsFile}`);

        // Try alternative approach - write directly to file
        try {
          log.info(`Attempting direct file write for ${keyPath}`);

          // Read existing settings
          let existingSettings = {};
          if (fs.existsSync(settingsFile)) {
            const fileContent = fs.readFileSync(settingsFile, 'utf8');
            existingSettings = JSON.parse(fileContent);
          }

          // Set the value using dot notation
          const keys = keyPath.split('.');
          let target = existingSettings;
          for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) target[keys[i]] = {};
            target = target[keys[i]];
          }
          target[keys[keys.length - 1]] = value;

          // Write the file directly
          fs.writeFileSync(settingsFile, JSON.stringify(existingSettings, null, 2));
          log.info(`Successfully set ${keyPath} using direct file write`);
          return true;
        } catch (fallbackError) {
          log.error(`Direct file write also failed for ${keyPath}:`, fallbackError);
        }
      }

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

  // Add handler for getting app paths (for debugging)
  ipcMain.handle('app:getPath', async (event, name) => {
    try {
      const path = app.getPath(name);
      log.debug(`App path ${name}: ${path}`);
      return path;
    } catch (error) {
      log.error(`Error getting app path ${name}:`, error);
      return null;
    }
  });

  log.info("Settings IPC handlers registered successfully");

  // Add logging IPC handlers for renderer process
  log.info("Registering logging IPC handlers...");

  ipcMain.handle('log:debug', async (event, component, message, data = null) => {
    const logMessage = data ? `[${component}] ${message}` : `[${component}] ${message}`;
    log.debug(logMessage, data || '');
    if (component.toLowerCase().includes('template')) {
      templateLog.debug(logMessage, data || '');
    }
  });

  ipcMain.handle('log:info', async (event, component, message, data = null) => {
    const logMessage = data ? `[${component}] ${message}` : `[${component}] ${message}`;
    log.info(logMessage, data || '');
    if (component.toLowerCase().includes('template')) {
      templateLog.info(logMessage, data || '');
    }
  });

  ipcMain.handle('log:warn', async (event, component, message, data = null) => {
    const logMessage = data ? `[${component}] ${message}` : `[${component}] ${message}`;
    log.warn(logMessage, data || '');
    if (component.toLowerCase().includes('template')) {
      templateLog.warn(logMessage, data || '');
    }
  });

  ipcMain.handle('log:error', async (event, component, message, error = null, data = null) => {
    const logMessage = `[${component}] ${message}`;
    if (error) {
      log.error(logMessage, error.message || error, error.stack || '');
      if (component.toLowerCase().includes('template')) {
        templateLog.error(logMessage, error.message || error, error.stack || '');
      }
    } else {
      log.error(logMessage, data || '');
      if (component.toLowerCase().includes('template')) {
        templateLog.error(logMessage, data || '');
      }
    }
  });

  ipcMain.handle('log:success', async (event, component, message, data = null) => {
    const logMessage = data ? `[${component}] ${message}` : `[${component}] ${message}`;
    log.info(`✅ ${logMessage}`, data || '');
    if (component.toLowerCase().includes('template')) {
      templateLog.info(`✅ ${logMessage}`, data || '');
    }
  });

  // Handler to get log file paths for debugging
  ipcMain.handle('log:getLogPaths', async (event) => {
    return {
      main: path.join(logsDir, 'main.log'),
      template: path.join(logsDir, 'template-system.log'),
      logsDir: logsDir
    };
  });

  // Handler to read log files
  ipcMain.handle('log:readLogFile', async (event, logType = 'main') => {
    try {
      const logFile = logType === 'template'
        ? path.join(logsDir, 'template-system.log')
        : path.join(logsDir, 'main.log');

      if (fs.existsSync(logFile)) {
        const content = fs.readFileSync(logFile, 'utf8');
        // Return last 1000 lines to avoid memory issues
        const lines = content.split('\n');
        return lines.slice(-1000).join('\n');
      }
      return 'Log file not found';
    } catch (error) {
      log.error('Error reading log file:', error);
      return `Error reading log file: ${error.message}`;
    }
  });

  log.info("Logging IPC handlers registered successfully");
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

// Create uploads directory for file storage in user data directory
const userDataPath = app.getPath('userData');
const uploadsDir = path.join(userDataPath, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  log.info(`Created uploads directory at: ${uploadsDir}`);
} else {
  log.debug(`Uploads directory already exists at: ${uploadsDir}`);
}

// Export the tmp and uploads directory paths for use in other files
module.exports = { tmpDir, uploadsDir };
