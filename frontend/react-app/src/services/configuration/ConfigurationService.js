import { getSettingsService } from '../settings/SettingsServiceFactory.js';
import { SETTINGS_KEYS, SETTINGS_EVENTS } from '../../shared/constants/SettingsConstants.js';

/**
 * Configuration Service
 * Provides a clean, domain-specific API over the low-level settings service
 * Uses Facade pattern to simplify complex settings operations
 */
export class ConfigurationService {
    constructor() {
        this.settingsService = null;
        this.initialized = false;
        this.eventListeners = new Map();
        this.init();
    }

    /**
     * Initialize the configuration service
     */
    async init() {
        try {
            this.settingsService = await getSettingsService();
            this.setupEventListeners();
            this.initialized = true;
            console.log('ConfigurationService initialized successfully');
        } catch (error) {
            console.error('Failed to initialize ConfigurationService:', error);
            throw error;
        }
    }

    /**
     * Setup event listeners for settings changes
     */
    setupEventListeners() {
        // Listen for settings changes and re-emit domain-specific events
        window.addEventListener(SETTINGS_EVENTS.SETTING_CHANGED, (event) => {
            this.handleSettingChange(event.detail);
        });

        window.addEventListener(SETTINGS_EVENTS.TEMPLATE_CHANGED, (event) => {
            this.emitEvent('template-changed', event.detail);
        });

        window.addEventListener(SETTINGS_EVENTS.THEME_CHANGED, (event) => {
            this.emitEvent('theme-changed', event.detail);
        });
    }

    /**
     * Handle generic setting changes
     * @param {object} detail - Change details
     */
    handleSettingChange(detail) {
        const { keyPath, value } = detail;

        // Emit more specific events based on keyPath
        if (keyPath.startsWith('invoice.')) {
            this.emitEvent('invoice-settings-changed', { keyPath, value });
        } else if (keyPath.startsWith('application.')) {
            this.emitEvent('app-settings-changed', { keyPath, value });
        } else if (keyPath.startsWith('company.')) {
            this.emitEvent('company-settings-changed', { keyPath, value });
        }
    }

    // ================================
    // TEMPLATE CONFIGURATION METHODS
    // ================================

    /**
     * Get selected template ID
     * @returns {Promise<string>} Template ID
     */
    async getSelectedTemplate() {
        console.log('[ConfigurationService] 🔍 Getting selected template from storage...');
        await this.ensureInitialized();
        const templateId = await this.settingsService.get(SETTINGS_KEYS.INVOICE_SELECTED_TEMPLATE);
        console.log('[ConfigurationService] 📋 Retrieved template from storage:', templateId);
        console.log('[ConfigurationService] 🔑 Using settings key:', SETTINGS_KEYS.INVOICE_SELECTED_TEMPLATE);
        return templateId;
    }

    /**
     * Set selected template ID
     * @param {string} templateId - Template ID
     * @returns {Promise<boolean>} Success status
     */
    async setSelectedTemplate(templateId) {
        console.log('[ConfigurationService] 💾 Setting selected template in storage:', templateId);
        console.log('[ConfigurationService] 🔑 Using settings key:', SETTINGS_KEYS.INVOICE_SELECTED_TEMPLATE);
        await this.ensureInitialized();
        const result = await this.settingsService.set(SETTINGS_KEYS.INVOICE_SELECTED_TEMPLATE, templateId);
        console.log('[ConfigurationService] 💾 Storage operation result:', result);

        // Verify the save by reading it back
        const verification = await this.settingsService.get(SETTINGS_KEYS.INVOICE_SELECTED_TEMPLATE);
        console.log('[ConfigurationService] ✅ Verification read:', verification);
        console.log('[ConfigurationService] 🔍 Save verification:', verification === templateId ? 'SUCCESS' : 'FAILED');

        return result;
    }

    /**
     * Get template settings
     * @returns {Promise<object>} Template settings
     */
    async getTemplateSettings() {
        await this.ensureInitialized();
        return await this.settingsService.get(SETTINGS_KEYS.INVOICE_TEMPLATE_SETTINGS);
    }

    /**
     * Update template settings
     * @param {object} settings - Settings to update
     * @returns {Promise<boolean>} Success status
     */
    async updateTemplateSettings(settings) {
        await this.ensureInitialized();
        const current = await this.getTemplateSettings();
        const merged = { ...current, ...settings };
        return await this.settingsService.set(SETTINGS_KEYS.INVOICE_TEMPLATE_SETTINGS, merged);
    }

    /**
     * Get template customizations for a specific template
     * @param {string} templateId - Template ID
     * @returns {Promise<object>} Template customizations
     */
    async getTemplateCustomizations(templateId) {
        await this.ensureInitialized();
        const allCustomizations = await this.settingsService.get(SETTINGS_KEYS.INVOICE_TEMPLATE_CUSTOMIZATIONS);
        return allCustomizations?.[templateId] || {};
    }

    /**
     * Set template customizations for a specific template
     * @param {string} templateId - Template ID
     * @param {object} customizations - Customizations to set
     * @returns {Promise<boolean>} Success status
     */
    async setTemplateCustomizations(templateId, customizations) {
        await this.ensureInitialized();
        const current = await this.settingsService.get(SETTINGS_KEYS.INVOICE_TEMPLATE_CUSTOMIZATIONS) || {};
        current[templateId] = { ...current[templateId], ...customizations };
        return await this.settingsService.set(SETTINGS_KEYS.INVOICE_TEMPLATE_CUSTOMIZATIONS, current);
    }

    // ================================
    // APPLICATION CONFIGURATION METHODS
    // ================================

    /**
     * Get application theme
     * @returns {Promise<string>} Theme ('light', 'dark', 'auto')
     */
    async getTheme() {
        await this.ensureInitialized();
        return await this.settingsService.get(SETTINGS_KEYS.APP_THEME);
    }

    /**
     * Set application theme
     * @param {string} theme - Theme to set
     * @returns {Promise<boolean>} Success status
     */
    async setTheme(theme) {
        await this.ensureInitialized();
        return await this.settingsService.set(SETTINGS_KEYS.APP_THEME, theme);
    }

    /**
     * Get application language
     * @returns {Promise<string>} Language code
     */
    async getLanguage() {
        await this.ensureInitialized();
        return await this.settingsService.get(SETTINGS_KEYS.APP_LANGUAGE);
    }

    /**
     * Set application language
     * @param {string} language - Language code
     * @returns {Promise<boolean>} Success status
     */
    async setLanguage(language) {
        await this.ensureInitialized();
        return await this.settingsService.set(SETTINGS_KEYS.APP_LANGUAGE, language);
    }

    // ================================
    // INVOICE CONFIGURATION METHODS
    // ================================

    /**
     * Get invoice defaults
     * @returns {Promise<object>} Invoice defaults
     */
    async getInvoiceDefaults() {
        await this.ensureInitialized();
        const currency = await this.settingsService.get(SETTINGS_KEYS.INVOICE_CURRENCY);
        const paymentTerms = await this.settingsService.get(SETTINGS_KEYS.INVOICE_PAYMENT_TERMS);
        const cgstRate = await this.settingsService.get(SETTINGS_KEYS.INVOICE_CGST_RATE);
        const sgstRate = await this.settingsService.get(SETTINGS_KEYS.INVOICE_SGST_RATE);
        const includeSignature = await this.settingsService.get(SETTINGS_KEYS.INVOICE_INCLUDE_SIGNATURE);

        return {
            currency,
            paymentTerms,
            cgstRate,
            sgstRate,
            includeSignature
        };
    }

    /**
     * Update invoice defaults
     * @param {object} defaults - Defaults to update
     * @returns {Promise<boolean>} Success status
     */
    async updateInvoiceDefaults(defaults) {
        await this.ensureInitialized();
        const updates = [];

        if (defaults.currency !== undefined) {
            updates.push(this.settingsService.set(SETTINGS_KEYS.INVOICE_CURRENCY, defaults.currency));
        }
        if (defaults.paymentTerms !== undefined) {
            updates.push(this.settingsService.set(SETTINGS_KEYS.INVOICE_PAYMENT_TERMS, defaults.paymentTerms));
        }
        if (defaults.cgstRate !== undefined) {
            updates.push(this.settingsService.set(SETTINGS_KEYS.INVOICE_CGST_RATE, defaults.cgstRate));
        }
        if (defaults.sgstRate !== undefined) {
            updates.push(this.settingsService.set(SETTINGS_KEYS.INVOICE_SGST_RATE, defaults.sgstRate));
        }
        if (defaults.includeSignature !== undefined) {
            updates.push(this.settingsService.set(SETTINGS_KEYS.INVOICE_INCLUDE_SIGNATURE, defaults.includeSignature));
        }

        const results = await Promise.all(updates);
        return results.every(result => result === true);
    }

    // ================================
    // COMPANY CONFIGURATION METHODS
    // ================================

    /**
     * Get company initials for a specific company
     * @param {string} companyId - Company ID
     * @returns {Promise<string>} Company initials
     */
    async getCompanyInitials(companyId) {
        await this.ensureInitialized();
        
        try {
            // First try to get from database
            if (window.electron && window.electron.getCompanyInvoicePrefix) {
                const response = await window.electron.getCompanyInvoicePrefix(companyId);
                if (response.success && response.invoicePrefix) {
                    console.log('✅ Got company initials from database:', response.invoicePrefix);
                    return response.invoicePrefix;
                }
            }
            
            // // Check local storage for migration purposes only
            // const initialsMap = await this.settingsService.get(SETTINGS_KEYS.COMPANY_INITIALS_MAP) || {};
            // if (initialsMap[companyId]) {
            //     console.log('🔄 Found initials in local storage, migrating to database:', initialsMap[companyId]);
                
            //     // Migrate to database
            //     if (window.electron && window.electron.setCompanyInvoicePrefix) {
            //         await window.electron.setCompanyInvoicePrefix(companyId, initialsMap[companyId]);
            //         console.log('✅ Migrated initials to database');
            //     }
                
            //     return initialsMap[companyId];
            // }
            
            // No initials found - return empty string (caller will generate)
            console.log('❌ No company initials found for company ID:', companyId);
            return '';
        } catch (error) {
            console.error('❌ Error getting company initials:', error);
            return '';
        }
    }

    /**
     * Set company initials for a specific company
     * @param {string} companyId - Company ID
     * @param {string} initials - Company initials
     * @returns {Promise<boolean>} Success status
     */
    async setCompanyInitials(companyId, initials) {
        await this.ensureInitialized();
        
        try {
            // Primary: Save to database
            if (window.electron && window.electron.setCompanyInvoicePrefix) {
                const response = await window.electron.setCompanyInvoicePrefix(companyId, initials);
                if (response.success) {
                    console.log('✅ Company initials saved to database:', initials);
                    
                    // Also save to local storage for backward compatibility during migration period
                    const current = await this.settingsService.get(SETTINGS_KEYS.COMPANY_INITIALS_MAP) || {};
                    current[companyId] = initials;
                    await this.settingsService.set(SETTINGS_KEYS.COMPANY_INITIALS_MAP, current);
                    
                    return true;
                } else {
                    console.error('❌ Failed to save company initials to database:', response.error || 'Unknown error');
                    return false;
                }
            }
            
            console.warn('⚠️ Database API not available, cannot save company initials');
            return false;
        } catch (error) {
            console.error('❌ Error setting company initials:', error);
            return false;
        }
    }

    /**
     * Get default company ID
     * @returns {Promise<string>} Default company ID
     */
    async getDefaultCompany() {
        await this.ensureInitialized();
        return await this.settingsService.get(SETTINGS_KEYS.COMPANY_DEFAULT_ID);
    }

    /**
     * Set default company ID
     * @param {string} companyId - Company ID
     * @returns {Promise<boolean>} Success status
     */
    async setDefaultCompany(companyId) {
        await this.ensureInitialized();
        return await this.settingsService.set(SETTINGS_KEYS.COMPANY_DEFAULT_ID, companyId);
    }

    // ================================
    // UI CONFIGURATION METHODS
    // ================================

    /**
     * Get UI preferences
     * @returns {Promise<object>} UI preferences
     */
    async getUIPreferences() {
        await this.ensureInitialized();
        return {
            sidebarCollapsed: await this.settingsService.get(SETTINGS_KEYS.UI_SIDEBAR_COLLAPSED),
            tablePageSize: await this.settingsService.get(SETTINGS_KEYS.UI_TABLE_PAGE_SIZE),
            dateFormat: await this.settingsService.get(SETTINGS_KEYS.UI_DATE_FORMAT),
            numberFormat: await this.settingsService.get(SETTINGS_KEYS.UI_NUMBER_FORMAT),
            showTooltips: await this.settingsService.get(SETTINGS_KEYS.UI_SHOW_TOOLTIPS),
            // Additional UI preferences that may not be in SETTINGS_KEYS
            autoSave: await this.settingsService.get('ui.autoSave'),
            compactMode: await this.settingsService.get('ui.compactMode'),
            showPreview: await this.settingsService.get('ui.showPreview'),
            notifications: await this.settingsService.get('ui.notifications')
        };
    }

    /**
     * Update UI preferences
     * @param {object} preferences - Preferences to update
     * @returns {Promise<boolean>} Success status
     */
    async updateUIPreferences(preferences) {
        await this.ensureInitialized();
        const updates = [];

        // Handle specific known UI preferences
        if (preferences.sidebarCollapsed !== undefined) {
            updates.push(this.settingsService.set(SETTINGS_KEYS.UI_SIDEBAR_COLLAPSED, preferences.sidebarCollapsed));
        }
        if (preferences.tablePageSize !== undefined) {
            updates.push(this.settingsService.set(SETTINGS_KEYS.UI_TABLE_PAGE_SIZE, preferences.tablePageSize));
        }
        if (preferences.dateFormat !== undefined) {
            updates.push(this.settingsService.set(SETTINGS_KEYS.UI_DATE_FORMAT, preferences.dateFormat));
        }
        if (preferences.numberFormat !== undefined) {
            updates.push(this.settingsService.set(SETTINGS_KEYS.UI_NUMBER_FORMAT, preferences.numberFormat));
        }
        if (preferences.showTooltips !== undefined) {
            updates.push(this.settingsService.set(SETTINGS_KEYS.UI_SHOW_TOOLTIPS, preferences.showTooltips));
        }

        // Handle additional UI preferences that may not be in SETTINGS_KEYS
        if (preferences.autoSave !== undefined) {
            updates.push(this.settingsService.set('ui.autoSave', preferences.autoSave));
        }
        if (preferences.compactMode !== undefined) {
            updates.push(this.settingsService.set('ui.compactMode', preferences.compactMode));
        }
        if (preferences.showPreview !== undefined) {
            updates.push(this.settingsService.set('ui.showPreview', preferences.showPreview));
        }
        if (preferences.notifications !== undefined) {
            updates.push(this.settingsService.set('ui.notifications', preferences.notifications));
        }

        const results = await Promise.all(updates);
        return results.every(result => result === true);
    }

    // ================================
    // BULK OPERATIONS
    // ================================

    /**
     * Get all configuration
     * @returns {Promise<object>} All configuration
     */
    async getAllConfiguration() {
        await this.ensureInitialized();
        return await this.settingsService.export();
    }

    /**
     * Reset configuration section
     * @param {string} section - Section to reset
     * @returns {Promise<boolean>} Success status
     */
    async resetSection(section) {
        await this.ensureInitialized();
        return await this.settingsService.reset(section);
    }

    /**
     * Export configuration
     * @returns {Promise<object>} Configuration data
     */
    async exportConfiguration() {
        await this.ensureInitialized();
        return await this.settingsService.export();
    }

    /**
     * Import configuration
     * @param {object} configuration - Configuration to import
     * @returns {Promise<boolean>} Success status
     */
    async importConfiguration(configuration) {
        await this.ensureInitialized();
        return await this.settingsService.import(configuration);
    }

    // ================================
    // EVENT MANAGEMENT
    // ================================

    /**
     * Subscribe to configuration changes
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     * @returns {function} Unsubscribe function
     */
    subscribe(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }

        this.eventListeners.get(event).add(callback);

        // Return unsubscribe function
        return () => {
            const listeners = this.eventListeners.get(event);
            if (listeners) {
                listeners.delete(callback);
                if (listeners.size === 0) {
                    this.eventListeners.delete(event);
                }
            }
        };
    }

    /**
     * Emit configuration event
     * @param {string} eventName - Event name
     * @param {object} data - Event data
     */
    emitEvent(eventName, data) {
        const listeners = this.eventListeners.get(eventName);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in configuration listener:', error);
                }
            });
        }
    }

    // ================================
    // UTILITY METHODS
    // ================================

    /**
     * Ensure service is initialized
     */
    async ensureInitialized() {
        if (!this.initialized) {
            await this.init();
        }
    }

    /**
     * Get service information
     * @returns {object} Service info
     */
    getServiceInfo() {
        return {
            initialized: this.initialized,
            settingsService: this.settingsService?.getServiceInfo?.() || null,
            listenerCount: Array.from(this.eventListeners.values())
                .reduce((total, listeners) => total + listeners.size, 0)
        };
    }

    /**
     * Destroy the service
     */
    destroy() {
        this.eventListeners.clear();
        if (this.settingsService?.destroy) {
            this.settingsService.destroy();
        }
        this.initialized = false;
    }
}

// Singleton instance
let configurationServiceInstance = null;

/**
 * Get singleton instance of configuration service
 * @returns {ConfigurationService} Configuration service instance
 */
export const getConfigurationService = () => {
    if (!configurationServiceInstance) {
        configurationServiceInstance = new ConfigurationService();
    }
    return configurationServiceInstance;
}; 