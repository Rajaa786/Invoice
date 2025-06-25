import { ISettingsProvider } from '../../shared/interfaces/ISettingsProvider.js';
import { DEFAULT_SETTINGS, getDefaultValue, validateSetting, SETTINGS_EVENTS } from '../../shared/constants/SettingsConstants.js';

/**
 * Electron Settings Service Implementation
 * Uses electron-settings for persistent storage in main process
 */
export class ElectronSettingsService extends ISettingsProvider {
    constructor() {
        super();
        this.eventListeners = new Map();
        this.initialized = false;
        this.init();
    }

    /**
     * Initialize the settings service
     */
    async init() {
        if (this.initialized) return;

        try {
            // Wait for electron APIs to be available
            await this.waitForElectronAPIs();

            // Check if any settings exist - directly query without using this.has() to avoid recursion
            let hasAnySettings = false;
            try {
                const value = await window.electronSettings.get('application');
                hasAnySettings = value !== undefined;
                console.log('Existing settings check result:', hasAnySettings);
            } catch (error) {
                console.log('No existing settings found, will initialize defaults');
            }

            // Initialize with default settings if first run
            if (!hasAnySettings) {
                await this.initializeDefaults();
            }

            this.initialized = true;
            console.log('ElectronSettingsService initialized successfully');
        } catch (error) {
            console.error('Failed to initialize ElectronSettingsService:', error);
            throw error;
        }
    }

    /**
     * Wait for electron APIs to be available
     */
    async waitForElectronAPIs() {
        const maxAttempts = 50; // 5 seconds max wait
        let attempts = 0;

        while (attempts < maxAttempts) {
            if (window.electronSettings) {
                console.log('Electron settings API is available');
                return;
            }
            
            console.log(`Waiting for electron settings API (attempt ${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        throw new Error('Electron settings API not available after waiting');
    }

    /**
     * Initialize default settings
     */
    async initializeDefaults() {
        try {
            for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
                await window.electronSettings.set(key, value);
            }
            console.log('Default settings initialized');
        } catch (error) {
            console.error('Failed to initialize default settings:', error);
            throw error;
        }
    }

    /**
     * Get a setting value by key path
     * @param {string} keyPath - Dot-separated path to setting
     * @returns {Promise<any>} Setting value
     */
    async get(keyPath) {
        try {
            if (!this.initialized) {
                await this.init();
            }

            const value = await window.electronSettings.get(keyPath);

            // Return default if value is undefined
            if (value === undefined) {
                return getDefaultValue(keyPath);
            }

            return value;
        } catch (error) {
            console.error(`Error getting setting ${keyPath}:`, error);
            return getDefaultValue(keyPath);
        }
    }

    /**
     * Set a setting value by key path
     * @param {string} keyPath - Dot-separated path to setting
     * @param {any} value - Value to set
     * @returns {Promise<boolean>} Success status
     */
    async set(keyPath, value) {
        try {
            if (!this.initialized) {
                await this.init();
            }

            console.log(`[ElectronSettingsService] Setting ${keyPath} to:`, value);

            // Validate the value
            const validation = validateSetting(keyPath, value);
            if (!validation.valid) {
                console.warn(`Invalid value for setting ${keyPath}:`, validation.errors);
                return false;
            }

            // Set the value
            const success = await window.electronSettings.set(keyPath, value);
            console.log(`[ElectronSettingsService] Set ${keyPath} result:`, success);

            if (success) {
                // Emit change event
                this.emitChange(keyPath, value);

                // Emit specific events for important settings
                this.emitSpecificEvents(keyPath, value);
            } else {
                console.error(`[ElectronSettingsService] Failed to set ${keyPath} - checking for permission issues`);
                
                // Try to diagnose the issue
                try {
                    const testRead = await window.electronSettings.get(keyPath);
                    console.log(`[ElectronSettingsService] Current value for ${keyPath}:`, testRead);
                } catch (readError) {
                    console.error(`[ElectronSettingsService] Cannot read ${keyPath}:`, readError);
                }
            }

            return success;
        } catch (error) {
            console.error(`Error setting ${keyPath}:`, error);
            
            // Check for permission errors
            if (error.message && error.message.includes('EPERM')) {
                console.error('🚨 PERMISSION ERROR DETECTED:');
                console.error('This is likely due to Windows file permissions or antivirus interference');
                console.error('Possible solutions:');
                console.error('1. Run the application as Administrator');
                console.error('2. Add the app to antivirus whitelist');
                console.error('3. Check Windows file permissions for AppData folder');
            }
            
            return false;
        }
    }

    /**
     * Reset settings to default values
     * @param {string} [section] - Optional section to reset
     * @returns {Promise<boolean>} Success status
     */
    async reset(section = null) {
        try {
            if (!this.initialized) {
                await this.init();
            }

            if (section) {
                // Reset specific section
                const defaultValue = DEFAULT_SETTINGS[section];
                if (defaultValue) {
                    const success = await window.electronSettings.set(section, defaultValue);
                    if (success) {
                        this.emitEvent(SETTINGS_EVENTS.SETTINGS_RESET, { section });
                    }
                    return success;
                }
                return false;
            } else {
                // Reset all settings
                let allSuccess = true;
                for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
                    const success = await window.electronSettings.set(key, value);
                    if (!success) {
                        allSuccess = false;
                    }
                }

                if (allSuccess) {
                    this.emitEvent(SETTINGS_EVENTS.SETTINGS_RESET, { section: 'all' });
                }

                return allSuccess;
            }
        } catch (error) {
            console.error('Error resetting settings:', error);
            return false;
        }
    }

    /**
     * Check if a setting exists
     * @param {string} keyPath - Dot-separated path to setting
     * @returns {Promise<boolean>} Exists status
     */
    async has(keyPath) {
        try {
            if (!this.initialized) {
                await this.init();
            }

            const value = await window.electronSettings.get(keyPath);
            return value !== undefined;
        } catch (error) {
            console.error(`Error checking setting ${keyPath}:`, error);
            return false;
        }
    }

    /**
     * Export all settings
     * @returns {Promise<object>} All settings
     */
    async export() {
        try {
            if (!this.initialized) {
                await this.init();
            }

            const settings = await window.electronSettings.export();
            this.emitEvent(SETTINGS_EVENTS.SETTINGS_EXPORTED, { timestamp: Date.now() });
            return settings;
        } catch (error) {
            console.error('Error exporting settings:', error);
            return null;
        }
    }

    /**
     * Import settings
     * @param {object} settings - Settings to import
     * @returns {Promise<boolean>} Success status
     */
    async import(settings) {
        try {
            if (!this.initialized) {
                await this.init();
            }

            // Validate settings structure
            if (!this.validateImportData(settings)) {
                console.error('Invalid settings data for import');
                return false;
            }

            const success = await window.electronSettings.import(settings);

            if (success) {
                this.emitEvent(SETTINGS_EVENTS.SETTINGS_IMPORTED, {
                    timestamp: Date.now(),
                    settingsCount: Object.keys(settings).length
                });
            }

            return success;
        } catch (error) {
            console.error('Error importing settings:', error);
            return false;
        }
    }

    /**
     * Subscribe to setting changes
     * @param {string} keyPath - Key path to watch
     * @param {function} callback - Callback function
     * @returns {function} Unsubscribe function
     */
    subscribe(keyPath, callback) {
        if (!this.eventListeners.has(keyPath)) {
            this.eventListeners.set(keyPath, new Set());
        }

        this.eventListeners.get(keyPath).add(callback);

        // Return unsubscribe function
        return () => {
            const listeners = this.eventListeners.get(keyPath);
            if (listeners) {
                listeners.delete(callback);
                if (listeners.size === 0) {
                    this.eventListeners.delete(keyPath);
                }
            }
        };
    }

    /**
     * Emit setting change event
     * @param {string} keyPath - Setting key path
     * @param {any} value - New value
     */
    emitChange(keyPath, value) {
        // Emit to specific listeners
        const listeners = this.eventListeners.get(keyPath);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(value, keyPath);
                } catch (error) {
                    console.error('Error in settings listener:', error);
                }
            });
        }

        // Emit generic change event
        this.emitEvent(SETTINGS_EVENTS.SETTING_CHANGED, { keyPath, value });
    }

    /**
     * Emit specific events for important settings
     * @param {string} keyPath - Setting key path
     * @param {any} value - New value
     */
    emitSpecificEvents(keyPath, value) {
        if (keyPath === 'invoice.templates.selectedTemplate') {
            this.emitEvent(SETTINGS_EVENTS.TEMPLATE_CHANGED, { templateId: value });
        } else if (keyPath === 'application.theme') {
            this.emitEvent(SETTINGS_EVENTS.THEME_CHANGED, { theme: value });
        }
    }

    /**
     * Emit custom event
     * @param {string} eventName - Event name
     * @param {object} data - Event data
     */
    emitEvent(eventName, data) {
        window.dispatchEvent(new CustomEvent(eventName, {
            detail: { ...data, timestamp: Date.now() }
        }));
    }

    /**
     * Validate import data structure
     * @param {object} settings - Settings to validate
     * @returns {boolean} Valid status
     */
    validateImportData(settings) {
        if (!settings || typeof settings !== 'object') {
            return false;
        }

        // Check if it has the expected structure
        const requiredSections = ['application', 'invoice', 'company', 'ui'];
        const hasRequiredSections = requiredSections.some(section =>
            settings.hasOwnProperty(section)
        );

        return hasRequiredSections;
    }

    /**
     * Get service info
     * @returns {object} Service information
     */
    getServiceInfo() {
        return {
            type: 'electron',
            initialized: this.initialized,
            listenerCount: Array.from(this.eventListeners.values())
                .reduce((total, listeners) => total + listeners.size, 0),
            version: '1.0.0'
        };
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.eventListeners.clear();
        this.initialized = false;
    }
} 