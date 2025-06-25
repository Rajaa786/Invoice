/**
 * Settings Constants and Default Values
 * Centralized configuration for all application settings
 */

// Settings Key Paths
export const SETTINGS_KEYS = {
    // Application Settings
    APP_THEME: 'application.theme',
    APP_LANGUAGE: 'application.language',
    APP_STARTUP_WELCOME: 'application.startup.showWelcome',
    APP_AUTO_SAVE: 'application.startup.autoSaveEnabled',
    APP_AUTO_BACKUP: 'application.startup.autoBackupEnabled',

    // Invoice Template Settings
    INVOICE_SELECTED_TEMPLATE: 'invoice.templates.selectedTemplate',
    INVOICE_TEMPLATE_CUSTOMIZATIONS: 'invoice.templates.customizations',
    INVOICE_TEMPLATE_SETTINGS: 'invoice.templates.settings',

    // Invoice Defaults
    INVOICE_CURRENCY: 'invoice.defaults.currency',
    INVOICE_PAYMENT_TERMS: 'invoice.defaults.paymentTerms',
    INVOICE_CGST_RATE: 'invoice.defaults.cgstRate',
    INVOICE_SGST_RATE: 'invoice.defaults.sgstRate',
    INVOICE_INCLUDE_SIGNATURE: 'invoice.defaults.includeSignature',

    // Invoice Workflow
    INVOICE_AUTO_GENERATE_NUMBER: 'invoice.workflow.autoGenerateInvoiceNumber',
    INVOICE_REQUIRE_APPROVAL: 'invoice.workflow.requireCustomerApproval',
    INVOICE_AUTO_SEND_EMAIL: 'invoice.workflow.autoSendEmail',
    INVOICE_SAVE_DRAFT_FIRST: 'invoice.workflow.saveAsDraftFirst',

    // Company Settings
    COMPANY_DEFAULT_ID: 'company.defaultCompanyId',
    COMPANY_LAST_USED: 'company.lastUsedCompany',
    COMPANY_INITIALS_MAP: 'company.companyInitialsMap',

    // UI Settings
    UI_SIDEBAR_COLLAPSED: 'ui.sidebarCollapsed',
    UI_TABLE_PAGE_SIZE: 'ui.tablePageSize',
    UI_DATE_FORMAT: 'ui.dateFormat',
    UI_NUMBER_FORMAT: 'ui.numberFormat',
    UI_SHOW_TOOLTIPS: 'ui.showTooltips',

    // Security Settings
    SECURITY_SESSION_TIMEOUT: 'security.sessionTimeout',
    SECURITY_REQUIRE_PASSWORD: 'security.requirePasswordForSettings',
    SECURITY_BACKUP_ENCRYPTION: 'security.backupEncryption'
};

// Default Settings Values
export const DEFAULT_SETTINGS = {
    application: {
        theme: 'light',
        language: 'en',
        startup: {
            showWelcome: true,
            autoSaveEnabled: true,
            autoBackupEnabled: true
        }
    },
    invoice: {
        templates: {
            selectedTemplate: 'classic_blue',
            customizations: {},
            settings: {
                pageSize: 'A4',
                orientation: 'portrait',
                fontSize: 'normal',
                margins: 'normal',
                showPreviewBeforeDownload: true,
                autoGeneratePDF: true,
                includeTaxBreakdown: true,
                showItemCodes: true
            }
        },
        defaults: {
            currency: 'INR',
            paymentTerms: '30',
            cgstRate: 9,
            sgstRate: 9,
            includeSignature: true,
            includeTermsAndConditions: false,
            defaultNotes: 'Thanks for your business.'
        },
        workflow: {
            autoGenerateInvoiceNumber: true,
            requireCustomerApproval: false,
            autoSendEmail: false,
            saveAsDraftFirst: true,
            enableQuickSave: true,
            validateBeforeSave: true
        }
    },
    company: {
        defaultCompanyId: null,
        lastUsedCompany: null,
        companyInitialsMap: {},
        rememberLastUsed: true
    },
    ui: {
        sidebarCollapsed: false,
        tablePageSize: 10,
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'en-IN',
        showTooltips: true,
        enableAnimations: true,
        compactMode: false,
        showAdvancedOptions: false,
        autoSave: true,
        showPreview: true,
        notifications: true
    },
    security: {
        sessionTimeout: 30,
        requirePasswordForSettings: false,
        backupEncryption: false,
        enableAuditLog: false,
        autoLockTimeout: 0
    }
};

// Settings Categories for UI Organization
export const SETTINGS_CATEGORIES = {
    GENERAL: 'general',
    INVOICE: 'invoice',
    TEMPLATES: 'templates',
    COMPANY: 'company',
    UI_UX: 'ui_ux',
    SECURITY: 'security',
    ADVANCED: 'advanced'
};

// Settings Validation Rules
export const SETTINGS_VALIDATION = {
    [SETTINGS_KEYS.APP_THEME]: {
        type: 'string',
        enum: ['light', 'dark', 'auto'],
        default: 'light'
    },
    [SETTINGS_KEYS.APP_LANGUAGE]: {
        type: 'string',
        enum: ['en', 'es', 'fr', 'de', 'hi'],
        default: 'en'
    },
    [SETTINGS_KEYS.INVOICE_SELECTED_TEMPLATE]: {
        type: 'string',
        required: true,
        default: 'classic_blue'
    },
    [SETTINGS_KEYS.INVOICE_CURRENCY]: {
        type: 'string',
        enum: ['INR', 'USD', 'EUR', 'GBP'],
        default: 'INR'
    },
    [SETTINGS_KEYS.INVOICE_CGST_RATE]: {
        type: 'number',
        min: 0,
        max: 50,
        default: 9
    },
    [SETTINGS_KEYS.INVOICE_SGST_RATE]: {
        type: 'number',
        min: 0,
        max: 50,
        default: 9
    },
    [SETTINGS_KEYS.UI_TABLE_PAGE_SIZE]: {
        type: 'number',
        min: 5,
        max: 100,
        default: 10
    }
};

// Event Names for Settings Changes
export const SETTINGS_EVENTS = {
    SETTING_CHANGED: 'settings:changed',
    TEMPLATE_CHANGED: 'settings:template_changed',
    THEME_CHANGED: 'settings:theme_changed',
    SETTINGS_RESET: 'settings:reset',
    SETTINGS_IMPORTED: 'settings:imported',
    SETTINGS_EXPORTED: 'settings:exported'
};

// Utility function to get nested default value
export const getDefaultValue = (keyPath) => {
    const keys = keyPath.split('.');
    let value = DEFAULT_SETTINGS;

    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return undefined;
        }
    }

    return value;
};

// Utility function to validate setting value
export const validateSetting = (keyPath, value) => {
    const validation = SETTINGS_VALIDATION[keyPath];
    if (!validation) return { valid: true };

    const errors = [];

    // Type validation
    if (validation.type) {
        const actualType = typeof value;
        if (actualType !== validation.type) {
            errors.push(`Expected ${validation.type}, got ${actualType}`);
        }
    }

    // Enum validation
    if (validation.enum && !validation.enum.includes(value)) {
        errors.push(`Value must be one of: ${validation.enum.join(', ')}`);
    }

    // Number range validation
    if (validation.type === 'number') {
        if (validation.min !== undefined && value < validation.min) {
            errors.push(`Value must be at least ${validation.min}`);
        }
        if (validation.max !== undefined && value > validation.max) {
            errors.push(`Value must be at most ${validation.max}`);
        }
    }

    // Required validation
    if (validation.required && (value === undefined || value === null || value === '')) {
        errors.push('This setting is required');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}; 