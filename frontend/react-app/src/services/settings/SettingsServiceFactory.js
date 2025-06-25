import { ISettingsProvider } from '../../shared/interfaces/ISettingsProvider.js';

/**
 * Settings Service Factory
 * Creates appropriate settings service based on environment
 * Enables loose coupling between settings consumers and providers
 */
export class SettingsServiceFactory {
    static _instance = null;
    static _currentService = null;
    static _initializationPromise = null;

    /**
     * Get singleton instance of settings service
     * @returns {Promise<ISettingsProvider>} Settings service instance
     */
    static async getInstance() {
        if (this._instance) {
            return this._instance;
        }

        // If initialization is already in progress, wait for it
        if (this._initializationPromise) {
            return this._initializationPromise;
        }

        // Start initialization
        this._initializationPromise = this.createService();
        this._instance = await this._initializationPromise;
        this._initializationPromise = null;
        
        return this._instance;
    }

    /**
     * Create appropriate settings service based on environment
     * @returns {Promise<ISettingsProvider>} Settings service instance
     */
    static async createService() {
        try {
            if (this.isElectronEnvironment()) {
                return await this.createElectronService();
            } else {
                return await this.createBrowserService();
            }
        } catch (error) {
            console.error('Failed to create settings service:', error);
            // Fallback to browser service
            return await this.createBrowserService();
        }
    }

    /**
     * Create Electron settings service
     * @returns {Promise<ISettingsProvider>} Electron settings service
     */
    static async createElectronService() {
        try {
            const module = await import('./ElectronSettingsService.js');
            const service = new module.ElectronSettingsService();
            await service.init(); // Ensure proper initialization
            console.log('ElectronSettingsService created and initialized');
            return service;
        } catch (error) {
            console.warn('Failed to load Electron settings service, falling back to browser service:', error);
            return await this.createBrowserService();
        }
    }

    /**
     * Create browser settings service (localStorage fallback)
     * @returns {Promise<ISettingsProvider>} Browser settings service
     */
    static async createBrowserService() {
        try {
            const module = await import('./BrowserSettingsService.js');
            const service = new module.BrowserSettingsService();
            await service.init(); // Ensure proper initialization
            console.log('BrowserSettingsService created and initialized');
            return service;
        } catch (error) {
            console.error('Failed to create browser settings service:', error);
            throw error;
        }
    }

    /**
     * Check if running in Electron environment
     * @returns {boolean} True if Electron environment
     */
    static isElectronEnvironment() {
        return typeof window !== 'undefined' &&
            window.electronSettings !== undefined;
    }

    /**
     * Manually set settings service (for testing or custom implementations)
     * @param {ISettingsProvider} service - Settings service instance
     */
    static setService(service) {
        if (!(service instanceof ISettingsProvider)) {
            throw new Error('Service must implement ISettingsProvider interface');
        }
        this._instance = service;
        this._initializationPromise = null;
    }

    /**
     * Reset factory (useful for testing)
     */
    static reset() {
        this._instance = null;
        this._currentService = null;
        this._initializationPromise = null;
    }

    /**
     * Get current service type
     * @returns {string} Service type name
     */
    static getCurrentServiceType() {
        if (this.isElectronEnvironment()) {
            return 'electron';
        } else {
            return 'browser';
        }
    }
}

/**
 * Environment Detection Utilities
 */
export class EnvironmentDetector {
    /**
     * Check if running in Electron
     */
    static isElectron() {
        return typeof window !== 'undefined' &&
            typeof window.process === 'object' &&
            window.process.type === 'renderer';
    }

    /**
     * Check if Electron APIs are available
     */
    static hasElectronAPIs() {
        return typeof window !== 'undefined' &&
            window.electronSettings !== undefined;
    }

    /**
     * Check if running in browser
     */
    static isBrowser() {
        return typeof window !== 'undefined' &&
            typeof window.localStorage !== 'undefined' &&
            !this.isElectron();
    }

    /**
     * Check if running in Node.js
     */
    static isNode() {
        return typeof process !== 'undefined' &&
            process.versions &&
            process.versions.node;
    }

    /**
     * Get environment info
     */
    static getEnvironmentInfo() {
        return {
            isElectron: this.isElectron(),
            hasElectronAPIs: this.hasElectronAPIs(),
            isBrowser: this.isBrowser(),
            isNode: this.isNode(),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
            platform: typeof process !== 'undefined' ? process.platform : 'Unknown'
        };
    }
}

/**
 * Service Registry for dependency injection
 */
export class ServiceRegistry {
    static _services = new Map();

    /**
     * Register a service
     * @param {string} name - Service name
     * @param {any} service - Service instance
     */
    static register(name, service) {
        this._services.set(name, service);
    }

    /**
     * Get a registered service
     * @param {string} name - Service name
     * @returns {any} Service instance
     */
    static get(name) {
        return this._services.get(name);
    }

    /**
     * Check if service is registered
     * @param {string} name - Service name
     * @returns {boolean} Registration status
     */
    static has(name) {
        return this._services.has(name);
    }

    /**
     * Unregister a service
     * @param {string} name - Service name
     */
    static unregister(name) {
        this._services.delete(name);
    }

    /**
     * Clear all services
     */
    static clear() {
        this._services.clear();
    }

    /**
     * Get all registered service names
     * @returns {string[]} Service names
     */
    static getServiceNames() {
        return Array.from(this._services.keys());
    }
}

/**
 * Get singleton instance of settings service
 * @returns {Promise<ISettingsProvider>} Settings service instance
 */
export const getSettingsService = async () => {
    return await SettingsServiceFactory.getInstance();
}; 