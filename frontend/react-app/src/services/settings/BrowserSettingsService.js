import { ISettingsProvider } from '../../shared/interfaces/ISettingsProvider.js';
import { DEFAULT_SETTINGS, getDefaultValue, validateSetting, SETTINGS_EVENTS } from '../../shared/constants/SettingsConstants.js';

/**
 * Browser Settings Service Implementation
 * Uses localStorage as fallback for non-Electron environments
 */
export class BrowserSettingsService extends ISettingsProvider {
    constructor() {
        super();
        this.storageKey = 'invoice-app-settings';
        this.eventListeners = new Map();
        this.initialized = false;
        this.init();
    }

    /**
     * Initialize the settings service
     */
    async init() {
        try {
            // Check if localStorage is available
            if (!this.isStorageAvailable()) {
                throw new Error('localStorage not available');
            }

            // Initialize with default settings if first run
            const existingSettings = this.getStorageData();
            if (!existingSettings || Object.keys(existingSettings).length === 0) {
                await this.initializeDefaults();
            }

            this.initialized = true;
            console.log('BrowserSettingsService initialized successfully');
        } catch (error) {
            console.error('Failed to initialize BrowserSettingsService:', error);
            throw error;
        }
    }

    /**
     * Check if localStorage is available
     * @returns {boolean} Storage availability
     */
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get storage data
     * @returns {object} Storage data
     */
    getStorageData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error reading storage data:', error);
            return {};
        }
    }

    /**
     * Set storage data
     * @param {object} data - Data to store
     * @returns {boolean} Success status
     */
    setStorageData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error writing storage data:', error);
            return false;
        }
    }

    /**
     * Initialize default settings
     */
    async initializeDefaults() {
        try {
            const success = this.setStorageData(DEFAULT_SETTINGS);
            if (success) {
                console.log('Default settings initialized in localStorage');
            }
            return success;
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

            const data = this.getStorageData();
            const value = this.getNestedValue(data, keyPath);

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

            // Validate the value
            const validation = validateSetting(keyPath, value);
            if (!validation.valid) {
                console.warn(`Invalid value for setting ${keyPath}:`, validation.errors);
                return false;
            }

            // Get current data
            const data = this.getStorageData();

            // Set nested value
            this.setNestedValue(data, keyPath, value);

            // Save back to storage
            const success = this.setStorageData(data);

            if (success) {
                // Emit change event
                this.emitChange(keyPath, value);

                // Emit specific events for important settings
                this.emitSpecificEvents(keyPath, value);
            }

            return success;
        } catch (error) {
            console.error(`Error setting ${keyPath}:`, error);
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
                    const data = this.getStorageData();
                    data[section] = JSON.parse(JSON.stringify(defaultValue)); // Deep copy
                    const success = this.setStorageData(data);

                    if (success) {
                        this.emitEvent(SETTINGS_EVENTS.SETTINGS_RESET, { section });
                    }
                    return success;
                }
                return false;
            } else {
                // Reset all settings
                const success = this.setStorageData(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)));

                if (success) {
                    this.emitEvent(SETTINGS_EVENTS.SETTINGS_RESET, { section: 'all' });
                }

                return success;
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

            const data = this.getStorageData();
            const value = this.getNestedValue(data, keyPath);
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

            const settings = this.getStorageData();
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

            const success = this.setStorageData(settings);

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
     * Get nested value from object using dot notation
     * @param {object} obj - Object to search
     * @param {string} keyPath - Dot-separated path
     * @returns {any} Value or undefined
     */
    getNestedValue(obj, keyPath) {
        const keys = keyPath.split('.');
        let current = obj;

        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return undefined;
            }
        }

        return current;
    }

    /**
     * Set nested value in object using dot notation
     * @param {object} obj - Object to modify
     * @param {string} keyPath - Dot-separated path
     * @param {any} value - Value to set
     */
    setNestedValue(obj, keyPath, value) {
        const keys = keyPath.split('.');
        let current = obj;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }

        current[keys[keys.length - 1]] = value;
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
            type: 'browser',
            initialized: this.initialized,
            storageAvailable: this.isStorageAvailable(),
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