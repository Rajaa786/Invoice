import { ISettingsProvider } from '../../shared/interfaces/ISettingsProvider.js';

/**
 * Settings Service Factory
 * Creates appropriate settings service based on environment
 * Enables loose coupling between settings consumers and providers
 */
export class SettingsServiceFactory {
    static _instance = null;
    static _currentService = null;

    /**
     * Get singleton instance of settings service
     * @returns {ISettingsProvider} Settings service instance
     */
    static getInstance() {
        if (!this._instance) {
            this._instance = this.createService();
        }
        return this._instance;
    }

    /**
     * Create appropriate settings service based on environment
     * @returns {ISettingsProvider} Settings service instance
     */
    static createService() {
        if (this.isElectronEnvironment()) {
            return this.createElectronService();
        } else {
            return this.createBrowserService();
        }
    }

    /**
     * Create Electron settings service
     * @returns {ISettingsProvider} Electron settings service
     */
    static createElectronService() {
        // Dynamic import to avoid issues in browser environment
        return import('./ElectronSettingsService.js').then(module => {
            return new module.ElectronSettingsService();
        }).catch(error => {
            console.warn('Failed to load Electron settings service, falling back to browser service:', error);
            return this.createBrowserService();
        });
    }

    /**
     * Create browser settings service (localStorage fallback)
     * @returns {ISettingsProvider} Browser settings service
     */
    static createBrowserService() {
        return import('./BrowserSettingsService.js').then(module => {
            return new module.BrowserSettingsService();
        });
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
    }

    /**
     * Reset factory (useful for testing)
     */
    static reset() {
        this._instance = null;
        this._currentService = null;
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

// Export singleton getter for convenience
export const getSettingsService = () => SettingsServiceFactory.getInstance(); 