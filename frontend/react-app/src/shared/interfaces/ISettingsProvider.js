/**
 * Settings Provider Interface
 * Defines the contract for settings storage implementations
 */
export class ISettingsProvider {
    /**
     * Get a setting value by key path
     * @param {string} keyPath - Dot-separated path to setting
     * @returns {Promise<any>} Setting value
     */
    async get(keyPath) {
        throw new Error('Method must be implemented');
    }

    /**
     * Set a setting value by key path
     * @param {string} keyPath - Dot-separated path to setting
     * @param {any} value - Value to set
     * @returns {Promise<boolean>} Success status
     */
    async set(keyPath, value) {
        throw new Error('Method must be implemented');
    }

    /**
     * Reset settings to default values
     * @param {string} [section] - Optional section to reset
     * @returns {Promise<boolean>} Success status
     */
    async reset(section = null) {
        throw new Error('Method must be implemented');
    }

    /**
     * Check if a setting exists
     * @param {string} keyPath - Dot-separated path to setting
     * @returns {Promise<boolean>} Exists status
     */
    async has(keyPath) {
        throw new Error('Method must be implemented');
    }

    /**
     * Export all settings
     * @returns {Promise<object>} All settings
     */
    async export() {
        throw new Error('Method must be implemented');
    }

    /**
     * Import settings
     * @param {object} settings - Settings to import
     * @returns {Promise<boolean>} Success status
     */
    async import(settings) {
        throw new Error('Method must be implemented');
    }

    /**
     * Subscribe to setting changes
     * @param {string} keyPath - Key path to watch
     * @param {function} callback - Callback function
     * @returns {function} Unsubscribe function
     */
    subscribe(keyPath, callback) {
        throw new Error('Method must be implemented');
    }
} 