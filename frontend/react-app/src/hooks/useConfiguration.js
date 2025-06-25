import { useState, useEffect, useCallback, useRef } from 'react';
import { getConfigurationService } from '../services/configuration/ConfigurationService.js';

/**
 * React Hook for Configuration Management
 * Provides clean integration between React components and configuration service
 */
export const useConfiguration = () => {
    const [configService, setConfigService] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState(null);
    const initializationRef = useRef(false);

    // Initialize configuration service
    useEffect(() => {
        if (initializationRef.current) return;
        initializationRef.current = true;

        const initService = async () => {
            try {
                const service = getConfigurationService();
                await service.ensureInitialized?.();
                setConfigService(service);
                setIsInitialized(true);
                setError(null);
            } catch (err) {
                console.error('Failed to initialize configuration service:', err);
                setError(err);
                setIsInitialized(false);
            }
        };

        initService();
    }, []);

    // Generic get method
    const get = useCallback(async (keyPath, defaultValue = undefined) => {
        if (!configService) return defaultValue;
        try {
            return await configService.settingsService.get(keyPath) ?? defaultValue;
        } catch (err) {
            console.error(`Error getting config ${keyPath}:`, err);
            return defaultValue;
        }
    }, [configService]);

    // Generic set method
    const set = useCallback(async (keyPath, value) => {
        if (!configService) return false;
        try {
            return await configService.settingsService.set(keyPath, value);
        } catch (err) {
            console.error(`Error setting config ${keyPath}:`, err);
            return false;
        }
    }, [configService]);

    return {
        configService,
        isInitialized,
        error,
        get,
        set
    };
};

/**
 * Hook for Template Configuration
 */
export const useTemplateConfiguration = () => {
    const { configService, isInitialized } = useConfiguration();
    const [selectedTemplate, setSelectedTemplateState] = useState('classic_blue');
    const [templateSettings, setTemplateSettingsState] = useState({});
    const [loading, setLoading] = useState(true);

    // Load initial template configuration
    useEffect(() => {
        if (!isInitialized || !configService) return;

        const loadTemplateConfig = async () => {
            try {
                setLoading(true);
                const [template, settings] = await Promise.all([
                    configService.getSelectedTemplate(),
                    configService.getTemplateSettings()
                ]);

                setSelectedTemplateState(template);
                setTemplateSettingsState(settings);
            } catch (error) {
                console.error('Error loading template configuration:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTemplateConfig();
    }, [isInitialized, configService]);

    // Set selected template
    const setSelectedTemplate = useCallback(async (templateId) => {
        if (!configService) return false;
        try {
            const success = await configService.setSelectedTemplate(templateId);
            if (success) {
                setSelectedTemplateState(templateId);
            }
            return success;
        } catch (error) {
            console.error('Error setting template:', error);
            return false;
        }
    }, [configService]);

    // Update template settings
    const updateTemplateSettings = useCallback(async (newSettings) => {
        if (!configService) return false;
        try {
            const success = await configService.updateTemplateSettings(newSettings);
            if (success) {
                setTemplateSettingsState(prev => ({ ...prev, ...newSettings }));
            }
            return success;
        } catch (error) {
            console.error('Error updating template settings:', error);
            return false;
        }
    }, [configService]);

    // Get template customizations
    const getTemplateCustomizations = useCallback(async (templateId) => {
        if (!configService) return {};
        try {
            return await configService.getTemplateCustomizations(templateId);
        } catch (error) {
            console.error('Error getting template customizations:', error);
            return {};
        }
    }, [configService]);

    // Set template customizations
    const setTemplateCustomizations = useCallback(async (templateId, customizations) => {
        if (!configService) return false;
        try {
            return await configService.setTemplateCustomizations(templateId, customizations);
        } catch (error) {
            console.error('Error setting template customizations:', error);
            return false;
        }
    }, [configService]);

    return {
        selectedTemplate,
        templateSettings,
        loading,
        setSelectedTemplate,
        updateTemplateSettings,
        getTemplateCustomizations,
        setTemplateCustomizations,
        isInitialized
    };
};

/**
 * Hook for Application Configuration
 */
export const useAppConfiguration = () => {
    const { configService, isInitialized } = useConfiguration();
    const [theme, setThemeState] = useState('light');
    const [language, setLanguageState] = useState('en');
    const [loading, setLoading] = useState(true);

    // Load initial app configuration
    useEffect(() => {
        if (!isInitialized || !configService) return;

        const loadAppConfig = async () => {
            try {
                setLoading(true);
                const [currentTheme, currentLanguage] = await Promise.all([
                    configService.getTheme(),
                    configService.getLanguage()
                ]);

                setThemeState(currentTheme);
                setLanguageState(currentLanguage);
            } catch (error) {
                console.error('Error loading app configuration:', error);
            } finally {
                setLoading(false);
            }
        };

        loadAppConfig();
    }, [isInitialized, configService]);

    // Set theme
    const setTheme = useCallback(async (newTheme) => {
        if (!configService) return false;
        try {
            const success = await configService.setTheme(newTheme);
            if (success) {
                setThemeState(newTheme);
            }
            return success;
        } catch (error) {
            console.error('Error setting theme:', error);
            return false;
        }
    }, [configService]);

    // Set language
    const setLanguage = useCallback(async (newLanguage) => {
        if (!configService) return false;
        try {
            const success = await configService.setLanguage(newLanguage);
            if (success) {
                setLanguageState(newLanguage);
            }
            return success;
        } catch (error) {
            console.error('Error setting language:', error);
            return false;
        }
    }, [configService]);

    return {
        theme,
        language,
        loading,
        setTheme,
        setLanguage,
        isInitialized
    };
};

/**
 * Hook for Invoice Configuration
 */
export const useInvoiceConfiguration = () => {
    const { configService, isInitialized } = useConfiguration();
    const [invoiceDefaults, setInvoiceDefaultsState] = useState({});
    const [loading, setLoading] = useState(true);

    // Load initial invoice configuration
    useEffect(() => {
        if (!isInitialized || !configService) return;

        const loadInvoiceConfig = async () => {
            try {
                setLoading(true);
                const defaults = await configService.getInvoiceDefaults();
                setInvoiceDefaultsState(defaults);
            } catch (error) {
                console.error('Error loading invoice configuration:', error);
            } finally {
                setLoading(false);
            }
        };

        loadInvoiceConfig();
    }, [isInitialized, configService]);

    // Update invoice defaults
    const updateInvoiceDefaults = useCallback(async (newDefaults) => {
        if (!configService) return false;
        try {
            const success = await configService.updateInvoiceDefaults(newDefaults);
            if (success) {
                setInvoiceDefaultsState(prev => ({ ...prev, ...newDefaults }));
            }
            return success;
        } catch (error) {
            console.error('Error updating invoice defaults:', error);
            return false;
        }
    }, [configService]);

    return {
        invoiceDefaults,
        loading,
        updateInvoiceDefaults,
        isInitialized
    };
};

/**
 * Hook for Company Configuration
 */
export const useCompanyConfiguration = () => {
    const { configService, isInitialized } = useConfiguration();

    // Get company initials
    const getCompanyInitials = useCallback(async (companyId) => {
        if (!configService) return '';
        try {
            return await configService.getCompanyInitials(companyId) || '';
        } catch (error) {
            console.error('Error getting company initials:', error);
            return '';
        }
    }, [configService]);

    // Set company initials
    const setCompanyInitials = useCallback(async (companyId, initials) => {
        if (!configService) return false;
        try {
            return await configService.setCompanyInitials(companyId, initials);
        } catch (error) {
            console.error('Error setting company initials:', error);
            return false;
        }
    }, [configService]);

    // Get default company
    const getDefaultCompany = useCallback(async () => {
        if (!configService) return null;
        try {
            return await configService.getDefaultCompany();
        } catch (error) {
            console.error('Error getting default company:', error);
            return null;
        }
    }, [configService]);

    // Set default company
    const setDefaultCompany = useCallback(async (companyId) => {
        if (!configService) return false;
        try {
            return await configService.setDefaultCompany(companyId);
        } catch (error) {
            console.error('Error setting default company:', error);
            return false;
        }
    }, [configService]);

    return {
        getCompanyInitials,
        setCompanyInitials,
        getDefaultCompany,
        setDefaultCompany,
        isInitialized
    };
};

/**
 * Hook for Configuration Events
 */
export const useConfigurationEvents = (eventName, callback) => {
    const { configService, isInitialized } = useConfiguration();

    useEffect(() => {
        if (!isInitialized || !configService || !callback) return;

        const unsubscribe = configService.subscribe(eventName, callback);
        return unsubscribe;
    }, [isInitialized, configService, eventName, callback]);
};

/**
 * Hook for Bulk Configuration Operations
 */
export const useBulkConfiguration = () => {
    const { configService, isInitialized } = useConfiguration();

    // Export configuration
    const exportConfiguration = useCallback(async () => {
        if (!configService) return null;
        try {
            return await configService.exportConfiguration();
        } catch (error) {
            console.error('Error exporting configuration:', error);
            return null;
        }
    }, [configService]);

    // Import configuration
    const importConfiguration = useCallback(async (configuration) => {
        if (!configService) return false;
        try {
            return await configService.importConfiguration(configuration);
        } catch (error) {
            console.error('Error importing configuration:', error);
            return false;
        }
    }, [configService]);

    // Reset section
    const resetSection = useCallback(async (section) => {
        if (!configService) return false;
        try {
            return await configService.resetSection(section);
        } catch (error) {
            console.error('Error resetting configuration section:', error);
            return false;
        }
    }, [configService]);

    return {
        exportConfiguration,
        importConfiguration,
        resetSection,
        isInitialized
    };
}; 