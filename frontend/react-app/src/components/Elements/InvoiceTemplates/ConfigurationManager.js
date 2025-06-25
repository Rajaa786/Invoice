/**
 * Configuration Manager for Invoice Templates
 * Updated to use the new decoupled configuration architecture
 * Maintains backward compatibility while leveraging the new services
 */

import { getConfigurationService } from '../../../services/configuration/ConfigurationService.js';
import { DEFAULT_TEMPLATE_ID, TemplateFactory } from './TemplateRegistry.js';

// Simple cache to prevent redundant API calls
const CONFIG_CACHE = new Map();
const CACHE_DURATION = 3000; // 3 seconds

/**
 * Configuration Manager - Bridge between old template system and new configuration service
 * Provides backward compatibility while using the new decoupled architecture
 */
export class ConfigurationManager {
    static _configService = null;
    static _migrationCompleted = false;

    /**
     * Get cached value or fetch fresh
     */
    static getCachedValue(key, fetchFunction) {
        const now = Date.now();
        const cached = CONFIG_CACHE.get(key);
        
        if (cached && (now - cached.timestamp) < CACHE_DURATION) {
            console.log(`[ConfigManager] Using cached value for ${key}`);
            return Promise.resolve(cached.value);
        }
        
        console.log(`[ConfigManager] Fetching fresh value for ${key}`);
        const promise = fetchFunction();
        
        // Cache the promise result
        promise.then(value => {
            CONFIG_CACHE.set(key, { value, timestamp: now });
        }).catch(() => {
            // Remove failed entries from cache
            CONFIG_CACHE.delete(key);
        });
        
        return promise;
    }

    /**
     * Clear cache for specific key or all
     */
    static clearCache(key = null) {
        if (key) {
            CONFIG_CACHE.delete(key);
        } else {
            CONFIG_CACHE.clear();
        }
    }

    /**
     * Get configuration service instance
     * @returns {Promise<ConfigurationService>} Configuration service
     */
    static async getConfigService() {
        if (!this._configService) {
            this._configService = await getConfigurationService();
            await this._configService.ensureInitialized();

            // Run migration on first access
            if (!this._migrationCompleted) {
                await this.migrateOldConfiguration();
                this._migrationCompleted = true;
            }
        }
        return this._configService;
    }

    /**
     * Get current configuration (async version)
     * @returns {Promise<Object>} Current configuration object
     */
    static async getConfiguration() {
        try {
            const [selectedTemplate, templateSettings, userPreferences, templateCustomizations] = await Promise.all([
                this.getSelectedTemplate(),
                this.getTemplateSettings(),
                this.getUserPreferences(),
                this.getTemplateCustomizations()
            ]);

            return {
                selectedTemplate,
                templateSettings,
                userPreferences,
                templateCustomizations
            };
        } catch (error) {
            console.error('Error getting configuration:', error);
            return this.getDefaultConfiguration();
        }
    }

    /**
     * Get default configuration
     * @returns {Object} Default configuration
     */
    static getDefaultConfiguration() {
        return {
            selectedTemplate: DEFAULT_TEMPLATE_ID,
            templateSettings: {
                pageSize: 'A4',
                orientation: 'portrait',
                fontSize: 'normal',
                margins: 'normal',
                colorScheme: 'default'
            },
            userPreferences: {
                showPreviewBeforeDownload: true,
                autoSaveTemplateChoice: true,
                rememberLastUsedTemplate: true,
                enableTemplateRecommendations: true
            },
            templateCustomizations: {}
        };
    }

    /**
     * Get selected template ID
     * @returns {Promise<string>} Selected template ID
     */
    static async getSelectedTemplate() {
        return this.getCachedValue('selectedTemplate', async () => {
            try {
                const configService = await this.getConfigService();
                const templateId = await configService.getSelectedTemplate();

                // Validate template exists
                if (templateId && TemplateFactory.getTemplate(templateId)) {
                    return templateId;
                }
                return DEFAULT_TEMPLATE_ID;
            } catch (error) {
                console.error('Error getting selected template:', error);
                return DEFAULT_TEMPLATE_ID;
            }
        });
    }

    /**
     * Set selected template ID
     * @param {string} templateId - Template ID to set
     * @returns {Promise<boolean>} True if successfully set
     */
    static async setSelectedTemplate(templateId) {
        try {
            // Validate template exists
            if (!TemplateFactory.getTemplate(templateId)) {
                console.warn(`Template "${templateId}" not found`);
                return false;
            }

            const configService = await this.getConfigService();
            const success = await configService.setSelectedTemplate(templateId);

            if (success) {
                // Clear cache to ensure fresh data on next get
                this.clearCache('selectedTemplate');
                
                // Emit legacy event for backward compatibility
                window.dispatchEvent(new CustomEvent('templateChanged', {
                    detail: { templateId, timestamp: Date.now() }
                }));
            }

            return success;
        } catch (error) {
            console.error('Error setting selected template:', error);
            return false;
        }
    }

    /**
     * Get template settings
     * @returns {Promise<Object>} Template settings object
     */
    static async getTemplateSettings() {
        return this.getCachedValue('templateSettings', async () => {
            try {
                const configService = await this.getConfigService();
                const settings = await configService.getTemplateSettings();

                // Merge with defaults to ensure all properties exist
                return {
                    pageSize: 'A4',
                    orientation: 'portrait',
                    fontSize: 'normal',
                    margins: 'normal',
                    colorScheme: 'default',
                    ...settings
                };
            } catch (error) {
                console.error('Error getting template settings:', error);
                return this.getDefaultConfiguration().templateSettings;
            }
        });
    }

    /**
     * Set template settings
     * @param {Object} settings - Settings object to merge
     * @returns {Promise<boolean>} True if successfully set
     */
    static async setTemplateSettings(settings) {
        try {
            const configService = await this.getConfigService();
            const success = await configService.updateTemplateSettings(settings);

            if (success) {
                // Clear cache to ensure fresh data on next get
                this.clearCache('templateSettings');
                
                // Emit legacy event for backward compatibility
                const newSettings = await this.getTemplateSettings();
                window.dispatchEvent(new CustomEvent('templateSettingsChanged', {
                    detail: { settings: newSettings, timestamp: Date.now() }
                }));
            }

            return success;
        } catch (error) {
            console.error('Error setting template settings:', error);
            return false;
        }
    }

    /**
     * Get user preferences
     * @returns {Promise<Object>} User preferences object
     */
    static async getUserPreferences() {
        try {
            const configService = await this.getConfigService();
            const templateSettings = await configService.getTemplateSettings();

            // Map new settings structure to legacy preferences
            return {
                showPreviewBeforeDownload: templateSettings.showPreviewBeforeDownload ?? true,
                autoSaveTemplateChoice: templateSettings.autoGeneratePDF ?? true,
                rememberLastUsedTemplate: true, // Always true in new system
                enableTemplateRecommendations: true // Always true in new system
            };
        } catch (error) {
            console.error('Error getting user preferences:', error);
            return this.getDefaultConfiguration().userPreferences;
        }
    }

    /**
     * Set user preferences
     * @param {Object} preferences - Preferences object to merge
     * @returns {Promise<boolean>} True if successfully set
     */
    static async setUserPreferences(preferences) {
        try {
            const configService = await this.getConfigService();

            // Map legacy preferences to new settings structure
            const settingsUpdate = {};
            if (preferences.showPreviewBeforeDownload !== undefined) {
                settingsUpdate.showPreviewBeforeDownload = preferences.showPreviewBeforeDownload;
            }
            if (preferences.autoSaveTemplateChoice !== undefined) {
                settingsUpdate.autoGeneratePDF = preferences.autoSaveTemplateChoice;
            }

            const success = await configService.updateTemplateSettings(settingsUpdate);

            if (success) {
                // Emit legacy event for backward compatibility
                const newPreferences = await this.getUserPreferences();
                window.dispatchEvent(new CustomEvent('userPreferencesChanged', {
                    detail: { preferences: newPreferences, timestamp: Date.now() }
                }));
            }

            return success;
        } catch (error) {
            console.error('Error setting user preferences:', error);
            return false;
        }
    }

    /**
     * Get template customizations
     * @returns {Promise<Object>} Template customizations object
     */
    static async getTemplateCustomizations() {
        try {
            const configService = await this.getConfigService();
            const allConfig = await configService.exportConfiguration();
            return allConfig?.invoice?.templates?.customizations || {};
        } catch (error) {
            console.error('Error getting template customizations:', error);
            return {};
        }
    }

    /**
     * Set template customizations for a specific template
     * @param {string} templateId - Template ID
     * @param {Object} customizations - Customizations object
     * @returns {Promise<boolean>} True if successfully set
     */
    static async setTemplateCustomizations(templateId, customizations) {
        try {
            const configService = await this.getConfigService();
            return await configService.setTemplateCustomizations(templateId, customizations);
        } catch (error) {
            console.error('Error setting template customizations:', error);
            return false;
        }
    }

    /**
     * Get customization for a specific template
     * @param {string} templateId - Template ID
     * @returns {Promise<Object>} Template customization
     */
    static async getTemplateCustomization(templateId) {
        try {
            const configService = await this.getConfigService();
            return await configService.getTemplateCustomizations(templateId);
        } catch (error) {
            console.error('Error getting template customization:', error);
            return {};
        }
    }

    /**
     * Reset configuration to defaults
     * @param {Array|null} keys - Specific keys to reset, or null for all
     * @returns {Promise<boolean>} True if successfully reset
     */
    static async resetConfiguration(keys = null) {
        try {
            const configService = await this.getConfigService();

            if (!keys) {
                // Reset all template-related configuration
                const results = await Promise.all([
                    configService.setSelectedTemplate(DEFAULT_TEMPLATE_ID),
                    configService.updateTemplateSettings({
                        pageSize: 'A4',
                        orientation: 'portrait',
                        fontSize: 'normal',
                        margins: 'normal',
                        colorScheme: 'default'
                    })
                ]);

                const success = results.every(result => result === true);

                if (success) {
                    window.dispatchEvent(new CustomEvent('configurationReset', {
                        detail: { timestamp: Date.now() }
                    }));
                }

                return success;
            } else {
                // Reset specific keys
                let allSuccess = true;

                for (const key of keys) {
                    if (key === 'selectedTemplate') {
                        allSuccess &= await configService.setSelectedTemplate(DEFAULT_TEMPLATE_ID);
                    } else if (key === 'templateSettings') {
                        allSuccess &= await configService.updateTemplateSettings({
                            pageSize: 'A4',
                            orientation: 'portrait',
                            fontSize: 'normal',
                            margins: 'normal',
                            colorScheme: 'default'
                        });
                    }
                    // Add other key resets as needed
                }

                return allSuccess;
            }
        } catch (error) {
            console.error('Error resetting configuration:', error);
            return false;
        }
    }

    /**
     * Export configuration as JSON string
     * @returns {Promise<string>} Configuration JSON
     */
    static async exportConfiguration() {
        try {
            const config = await this.getConfiguration();
            return JSON.stringify({
                ...config,
                exportedAt: new Date().toISOString(),
                version: '2.0'
            }, null, 2);
        } catch (error) {
            console.error('Error exporting configuration:', error);
            return null;
        }
    }

    /**
     * Import configuration from JSON string
     * @param {string} configJson - Configuration JSON string
     * @returns {Promise<boolean>} True if successfully imported
     */
    static async importConfiguration(configJson) {
        try {
            const config = JSON.parse(configJson);

            // Validate configuration structure
            const validation = this.validateConfiguration(config);
            if (!validation.valid) {
                console.error('Invalid configuration:', validation.errors);
                return false;
            }

            const configService = await this.getConfigService();
            let success = true;

            // Import each section
            if (config.selectedTemplate) {
                success &= await configService.setSelectedTemplate(config.selectedTemplate);
            }

            if (config.templateSettings) {
                success &= await configService.updateTemplateSettings(config.templateSettings);
            }

            if (config.userPreferences) {
                success &= await this.setUserPreferences(config.userPreferences);
            }

            if (config.templateCustomizations) {
                for (const [templateId, customizations] of Object.entries(config.templateCustomizations)) {
                    success &= await configService.setTemplateCustomizations(templateId, customizations);
                }
            }

            if (success) {
                window.dispatchEvent(new CustomEvent('configurationImported', {
                    detail: { timestamp: Date.now() }
                }));
            }

            return success;
        } catch (error) {
            console.error('Error importing configuration:', error);
            return false;
        }
    }

    /**
     * Validate configuration object
     * @param {Object} config - Configuration to validate
     * @returns {Object} Validation result with valid flag and errors array
     */
    static validateConfiguration(config) {
        const errors = [];

        if (!config || typeof config !== 'object') {
            errors.push('Configuration must be an object');
            return { valid: false, errors };
        }

        // Validate selected template
        if (config.selectedTemplate && typeof config.selectedTemplate !== 'string') {
            errors.push('selectedTemplate must be a string');
        }

        // Validate template settings
        if (config.templateSettings && typeof config.templateSettings !== 'object') {
            errors.push('templateSettings must be an object');
        }

        // Validate user preferences
        if (config.userPreferences && typeof config.userPreferences !== 'object') {
            errors.push('userPreferences must be an object');
        }

        // Validate template customizations
        if (config.templateCustomizations && typeof config.templateCustomizations !== 'object') {
            errors.push('templateCustomizations must be an object');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Get migration info
     * @returns {Object} Migration information
     */
    static getMigrationInfo() {
        const hasOldConfig = Boolean(
            localStorage.getItem('invoice_selected_template') ||
            localStorage.getItem('invoice_template_settings') ||
            localStorage.getItem('invoice_user_preferences') ||
            localStorage.getItem('invoice_template_customizations')
        );

        return {
            hasOldConfiguration: hasOldConfig,
            migrationCompleted: this._migrationCompleted,
            newArchitectureActive: Boolean(this._configService)
        };
    }

    /**
     * Migrate old localStorage configuration to new system
     * @returns {Promise<boolean>} Migration success
     */
    static async migrateOldConfiguration() {
        try {
            const oldKeys = [
                'invoice_selected_template',
                'invoice_template_settings',
                'invoice_user_preferences',
                'invoice_template_customizations'
            ];

            const hasOldConfig = oldKeys.some(key => localStorage.getItem(key));

            if (!hasOldConfig) {
                return true; // No migration needed
            }

            console.log('Migrating old configuration to new system...');

            const configService = await this.getConfigService();
            let migrationSuccess = true;

            // Migrate selected template
            const oldTemplate = localStorage.getItem('invoice_selected_template');
            if (oldTemplate) {
                try {
                    const templateId = JSON.parse(oldTemplate);
                    migrationSuccess &= await configService.setSelectedTemplate(templateId);
                } catch (e) {
                    console.warn('Failed to migrate selected template:', e);
                }
            }

            // Migrate template settings
            const oldSettings = localStorage.getItem('invoice_template_settings');
            if (oldSettings) {
                try {
                    const settings = JSON.parse(oldSettings);
                    migrationSuccess &= await configService.updateTemplateSettings(settings);
                } catch (e) {
                    console.warn('Failed to migrate template settings:', e);
                }
            }

            // Migrate user preferences
            const oldPrefs = localStorage.getItem('invoice_user_preferences');
            if (oldPrefs) {
                try {
                    const prefs = JSON.parse(oldPrefs);
                    migrationSuccess &= await this.setUserPreferences(prefs);
                } catch (e) {
                    console.warn('Failed to migrate user preferences:', e);
                }
            }

            // Migrate template customizations
            const oldCustomizations = localStorage.getItem('invoice_template_customizations');
            if (oldCustomizations) {
                try {
                    const customizations = JSON.parse(oldCustomizations);
                    for (const [templateId, custom] of Object.entries(customizations)) {
                        migrationSuccess &= await configService.setTemplateCustomizations(templateId, custom);
                    }
                } catch (e) {
                    console.warn('Failed to migrate template customizations:', e);
                }
            }

            if (migrationSuccess) {
                // Clean up old localStorage entries
                oldKeys.forEach(key => localStorage.removeItem(key));
                console.log('Configuration migration completed successfully');
            } else {
                console.warn('Configuration migration completed with some errors');
            }

            return migrationSuccess;
        } catch (error) {
            console.error('Error during configuration migration:', error);
            return false;
        }
    }

    /**
     * Setup event listeners for configuration changes
     * @param {Object} callbacks - Callback functions for different events
     * @returns {Function} Cleanup function to remove listeners
     */
    static setupEventListeners(callbacks = {}) {
        const listeners = [];

        // Template change listener
        if (callbacks.onTemplateChange) {
            const templateHandler = (event) => callbacks.onTemplateChange(event.detail);
            window.addEventListener('templateChanged', templateHandler);
            listeners.push(['templateChanged', templateHandler]);
        }

        // Settings change listener
        if (callbacks.onSettingsChange) {
            const settingsHandler = (event) => callbacks.onSettingsChange(event.detail);
            window.addEventListener('templateSettingsChanged', settingsHandler);
            listeners.push(['templateSettingsChanged', settingsHandler]);
        }

        // Preferences change listener
        if (callbacks.onPreferencesChange) {
            const prefsHandler = (event) => callbacks.onPreferencesChange(event.detail);
            window.addEventListener('userPreferencesChanged', prefsHandler);
            listeners.push(['userPreferencesChanged', prefsHandler]);
        }

        // Return cleanup function
        return () => {
            listeners.forEach(([event, handler]) => {
                window.removeEventListener(event, handler);
            });
        };
    }

    /**
     * Remove event listeners
     * @param {Object} callbacks - Callback functions to remove
     */
    static removeEventListeners(callbacks = {}) {
        if (callbacks.onTemplateChange) {
            window.removeEventListener('templateChanged', callbacks.onTemplateChange);
        }
        if (callbacks.onSettingsChange) {
            window.removeEventListener('templateSettingsChanged', callbacks.onSettingsChange);
        }
        if (callbacks.onPreferencesChange) {
            window.removeEventListener('userPreferencesChanged', callbacks.onPreferencesChange);
        }
    }
}

export default ConfigurationManager; 