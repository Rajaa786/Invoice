import { useState, useEffect, useCallback, useRef } from 'react';
import { getConfigurationService } from '../services/configuration/ConfigurationService.js';

// Global cache to prevent redundant API calls
const SETTINGS_CACHE = new Map();
const CACHE_EXPIRY = 5000; // 5 seconds
let configServiceInstance = null;

// Debounce utility
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Get cached value or fetch if not cached/expired
 */
const getCachedValue = async (key, fetchFn) => {
    const now = Date.now();
    const cached = SETTINGS_CACHE.get(key);

    if (cached && (now - cached.timestamp) < CACHE_EXPIRY) {
        console.log(`Using cached value for ${key}:`, cached.value);
        return cached.value;
    }

    console.log(`Fetching fresh value for ${key}`);
    const value = await fetchFn();
    SETTINGS_CACHE.set(key, { value, timestamp: now });
    return value;
};

/**
 * Clear cache for a specific key or all keys
 */
const clearCache = (key = null) => {
    if (key) {
        SETTINGS_CACHE.delete(key);
    } else {
        SETTINGS_CACHE.clear();
    }
};

/**
 * React Hook for Configuration Management
 * Provides clean integration between React components and configuration service
 */
export const useConfiguration = () => {
    const [configService, setConfigService] = useState(configServiceInstance);
    const [isInitialized, setIsInitialized] = useState(!!configServiceInstance);
    const [error, setError] = useState(null);
    const initializationRef = useRef(false);

    // Initialize configuration service
    useEffect(() => {
        if (initializationRef.current || configServiceInstance) return;
        initializationRef.current = true;

        const initService = async () => {
            try {
                console.log('Initializing configuration service...');
                const service = await getConfigurationService();

                // Ensure the service is properly initialized
                await service.ensureInitialized();

                console.log('Configuration service initialized successfully');
                configServiceInstance = service;
                setConfigService(service);
                setIsInitialized(true);
                setError(null);
            } catch (err) {
                console.error('Failed to initialize configuration service:', err);
                setError(err);
                setIsInitialized(false);

                // Retry after a delay
                setTimeout(() => {
                    console.log('Retrying configuration service initialization...');
                    initializationRef.current = false;
                }, 2000);
            }
        };

        initService();
    }, []);

    // Generic get method with caching
    const get = useCallback(async (keyPath, defaultValue = undefined) => {
        if (!configService || !isInitialized) {
            console.warn(`Config service not ready, returning default for ${keyPath}`);
            return defaultValue;
        }

        try {
            return await getCachedValue(keyPath, async () => {
                const value = await configService.settingsService.get(keyPath);
                return value ?? defaultValue;
            });
        } catch (err) {
            console.error(`Error getting config ${keyPath}:`, err);
            return defaultValue;
        }
    }, [configService, isInitialized]);

    // Generic set method with debouncing and cache invalidation
    const set = useCallback(debounce(async (keyPath, value) => {
        if (!configService || !isInitialized) {
            console.warn(`Config service not ready, cannot set ${keyPath}`);
            return false;
        }
        try {
            console.log(`Setting config ${keyPath} to:`, value);
            const result = await configService.settingsService.set(keyPath, value);
            if (result) {
                // Clear cache for this key so next get fetches fresh value
                clearCache(keyPath);
                console.log(`Set config ${keyPath} result:`, result);
            }
            return result;
        } catch (err) {
            console.error(`Error setting config ${keyPath}:`, err);
            return false;
        }
    }, 300), [configService, isInitialized]); // 300ms debounce

    return {
        configService,
        isInitialized,
        error,
        get,
        set,
        clearCache
    };
};

/**
 * Hook for Template Configuration
 */
export const useTemplateConfiguration = () => {
    const { configService, isInitialized, get, set } = useConfiguration();
    const [selectedTemplate, setSelectedTemplateState] = useState('classic_blue');
    const [templateSettings, setTemplateSettingsState] = useState({});
    const [loading, setLoading] = useState(true);
    const loadingRef = useRef(false);

    // Load initial template configuration only once
    useEffect(() => {
        if (!isInitialized || !configService || loadingRef.current) return;
        loadingRef.current = true;

        const loadTemplateConfig = async () => {
            try {
                setLoading(true);
                console.log('Loading template configuration...');

                const [template, settings] = await Promise.all([
                    get('invoice.templates.selectedTemplate', 'classic_blue'),
                    get('invoice.templates.settings', {
                        pageSize: 'A4',
                        orientation: 'portrait',
                        fontSize: 'normal',
                        margins: 'normal',
                        colorScheme: 'default'
                    })
                ]);

                console.log('Loaded template configuration:', { template, settings });

                setSelectedTemplateState(template);
                setTemplateSettingsState(settings);
            } catch (error) {
                console.error('Error loading template configuration:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTemplateConfig();
    }, [isInitialized, configService, get]);

    // Set selected template with optimistic updates
    const setSelectedTemplate = useCallback(async (templateId) => {
        if (!configService) return false;
        try {
            // Optimistic update
            setSelectedTemplateState(templateId);
            const success = await set('invoice.templates.selectedTemplate', templateId);
            if (!success) {
                // Revert on failure
                const currentTemplate = await get('invoice.templates.selectedTemplate', 'classic_blue');
                setSelectedTemplateState(currentTemplate);
            }
            return success;
        } catch (error) {
            console.error('Error setting template:', error);
            return false;
        }
    }, [configService, set, get]);

    // Update template settings with optimistic updates
    const updateTemplateSettings = useCallback(async (newSettings) => {
        if (!configService) return false;
        try {
            // 🔧 FIXED: Use functional setState to avoid templateSettings dependency
            setTemplateSettingsState(prevSettings => {
                const mergedSettings = { ...prevSettings, ...newSettings };

                // Async save operation (don't wait for it in setState)
                set('invoice.templates.settings', mergedSettings).then(success => {
                    if (!success) {
                        // Revert on failure by fetching current state
                        get('invoice.templates.settings', prevSettings).then(currentSettings => {
                            setTemplateSettingsState(currentSettings);
                        });
                    }
                }).catch(error => {
                    console.error('Error updating template settings:', error);
                    // Revert to previous state on error
                    setTemplateSettingsState(prevSettings);
                });

                return mergedSettings;
            });

            return true; // Return immediately for optimistic UI
        } catch (error) {
            console.error('Error updating template settings:', error);
            return false;
        }
    }, [configService, set, get]); // 🔧 FIXED: Removed templateSettings dependency!

    // Get template customizations
    const getTemplateCustomizations = useCallback(async (templateId) => {
        if (!configService) return {};
        try {
            return await get(`invoice.templates.customizations.${templateId}`, {});
        } catch (error) {
            console.error('Error getting template customizations:', error);
            return {};
        }
    }, [configService, get]);

    // Set template customizations
    const setTemplateCustomizations = useCallback(async (templateId, customizations) => {
        if (!configService) return false;
        try {
            return await set(`invoice.templates.customizations.${templateId}`, customizations);
        } catch (error) {
            console.error('Error setting template customizations:', error);
            return false;
        }
    }, [configService, set]);

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
                console.log('Loading app configuration...');

                const [currentTheme, currentLanguage] = await Promise.all([
                    configService.getTheme(),
                    configService.getLanguage()
                ]);

                console.log('Loaded theme:', currentTheme, 'language:', currentLanguage);
                console.log('Theme type:', typeof currentTheme, 'Language type:', typeof currentLanguage);

                // Use fallback values if undefined
                const finalTheme = currentTheme || 'light';
                const finalLanguage = currentLanguage || 'en';

                console.log('Setting final values - theme:', finalTheme, 'language:', finalLanguage);

                setThemeState(finalTheme);
                setLanguageState(finalLanguage);
            } catch (error) {
                console.error('Error loading app configuration:', error);
                // Set fallback values on error
                setThemeState('light');
                setLanguageState('en');
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
            console.log('Setting theme to:', newTheme);
            const success = await configService.setTheme(newTheme);
            if (success) {
                setThemeState(newTheme);
                console.log('Theme set successfully');
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
            console.log('Setting language to:', newLanguage);
            const success = await configService.setLanguage(newLanguage);
            if (success) {
                setLanguageState(newLanguage);
                console.log('Language set successfully');
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

/**
 * Hook for UI Configuration
 */
export const useUIConfiguration = () => {
    const { configService, isInitialized } = useConfiguration();
    const [uiPreferences, setUIPreferencesState] = useState({
        autoSave: false,
        compactMode: false,
        showPreview: true,
        notifications: true
    });
    const [loading, setLoading] = useState(true);

    // Load initial UI configuration
    useEffect(() => {
        if (!isInitialized || !configService) return;

        const loadUIConfig = async () => {
            try {
                setLoading(true);
                console.log('Loading UI configuration...');

                const preferences = await configService.getUIPreferences();
                console.log('Loaded UI preferences:', preferences);
                console.log('UI preferences type:', typeof preferences);

                // Merge with defaults to ensure all properties exist
                const defaultPreferences = {
                    autoSave: false,
                    compactMode: false,
                    showPreview: true,
                    notifications: true,
                    sidebarCollapsed: false,
                    tablePageSize: 10,
                    dateFormat: 'DD/MM/YYYY',
                    numberFormat: 'en-IN',
                    showTooltips: true
                };

                const mergedPreferences = { ...defaultPreferences, ...preferences };
                console.log('Merged UI preferences:', mergedPreferences);
                console.log('AutoSave value:', mergedPreferences.autoSave, 'type:', typeof mergedPreferences.autoSave);
                console.log('ShowPreview value:', mergedPreferences.showPreview, 'type:', typeof mergedPreferences.showPreview);

                setUIPreferencesState(mergedPreferences);
                console.log('UI preferences set to:', mergedPreferences);
            } catch (error) {
                console.error('Error loading UI configuration:', error);
                // Keep default values on error
            } finally {
                setLoading(false);
            }
        };

        loadUIConfig();
    }, [isInitialized, configService]);

    // Update UI preferences
    const updateUIPreferences = useCallback(async (newPreferences) => {
        if (!configService) return false;
        try {
            console.log('Updating UI preferences:', newPreferences);
            const success = await configService.updateUIPreferences(newPreferences);
            if (success) {
                setUIPreferencesState(prev => {
                    const updated = { ...prev, ...newPreferences };
                    console.log('UI preferences updated to:', updated);
                    return updated;
                });
            }
            return success;
        } catch (error) {
            console.error('Error updating UI preferences:', error);
            return false;
        }
    }, [configService]);

    // Individual setter methods for convenience
    const setAutoSave = useCallback(async (autoSave) => {
        console.log('Setting autoSave to:', autoSave);
        return await updateUIPreferences({ autoSave });
    }, [updateUIPreferences]);

    const setCompactMode = useCallback(async (compactMode) => {
        console.log('Setting compactMode to:', compactMode);
        return await updateUIPreferences({ compactMode });
    }, [updateUIPreferences]);

    const setShowPreview = useCallback(async (showPreview) => {
        console.log('Setting showPreview to:', showPreview);
        return await updateUIPreferences({ showPreview });
    }, [updateUIPreferences]);

    const setNotifications = useCallback(async (notifications) => {
        console.log('Setting notifications to:', notifications);
        return await updateUIPreferences({ notifications });
    }, [updateUIPreferences]);

    return {
        uiPreferences,
        loading,
        updateUIPreferences,
        setAutoSave,
        setCompactMode,
        setShowPreview,
        setNotifications,
        isInitialized
    };
}; 