// Lazy import functions to prevent PDF components from loading in DOM context
const getClassicBlueTemplate = () => import('./ClassicBlueTemplate').then(mod => mod.default);
const getModernGreenTemplate = () => import('./ModernGreenTemplate').then(mod => mod.default);
const getMinimalWhiteTemplate = () => import('./MinimalWhiteTemplate').then(mod => mod.default);
const getElegantPurpleTemplate = () => import('./ElegantPurpleTemplate').then(mod => mod.default);

// Template Registry - Central registry for all invoice templates
export const TEMPLATE_REGISTRY = {
    classic_blue: {
        id: 'classic_blue',
        name: 'Classic Blue',
        description: 'Professional and elegant design with blue accents',
        category: 'Professional',
        features: [
            'Blue color scheme',
            'Rounded corners',
            'Modern typography',
            'Card-based layout',
            'Professional appearance',
            'Company logo support',
            'Tax Invoice title'
        ],
        preview: '/images/templates/classic-blue-preview.png', // We'll create this later
        component: null, // Will be loaded lazily
        componentLoader: getClassicBlueTemplate,
        colors: {
            primary: '#1e3a8a',
            secondary: '#3b82f6',
            accent: '#10b981'
        },
        tags: ['professional', 'blue', 'elegant', 'corporate', 'logo'],
        compatibility: ['A4', 'Letter'],
        version: '1.1.0',
        isDefault: true
    },
    modern_green: {
        id: 'modern_green',
        name: 'Modern Green',
        description: 'Fresh and vibrant design with green colors',
        category: 'Modern',
        features: [
            'Green color palette',
            'Card-based design',
            'Modern layout',
            'Grid system',
            'Contemporary styling',
            'Company logo support',
            'Tax Invoice title'
        ],
        preview: '/images/templates/modern-green-preview.png',
        component: null, // Will be loaded lazily
        componentLoader: getModernGreenTemplate,
        colors: {
            primary: '#16a34a',
            secondary: '#22c55e',
            accent: '#84cc16'
        },
        tags: ['modern', 'green', 'fresh', 'vibrant', 'cards', 'logo'],
        compatibility: ['A4', 'Letter'],
        version: '1.1.0',
        isDefault: false
    },
    minimal_white: {
        id: 'minimal_white',
        name: 'Minimal White',
        description: 'Clean and minimalist design with black and white theme',
        category: 'Minimal',
        features: [
            'Minimalist design',
            'Black and white',
            'Clean typography',
            'Simple layout',
            'Distraction-free',
            'Company logo support',
            'Tax Invoice title'
        ],
        preview: '/images/templates/minimal-white-preview.png',
        component: null, // Will be loaded lazily
        componentLoader: getMinimalWhiteTemplate,
        colors: {
            primary: '#000000',
            secondary: '#333333',
            accent: '#666666'
        },
        tags: ['minimal', 'clean', 'simple', 'black-white', 'basic', 'logo'],
        compatibility: ['A4', 'Letter'],
        version: '1.1.0',
        isDefault: false
    },
    elegant_purple: {
        id: 'elegant_purple',
        name: 'Elegant Purple',
        description: 'Sophisticated and premium design with purple accents',
        category: 'Professional',
        features: [
            'Purple color scheme',
            'Sophisticated layout',
            'Premium appearance',
            'Elegant typography',
            'Stylish design',
            'Company logo support',
            'Tax Invoice title'
        ],
        preview: '/images/templates/elegant-purple-preview.png',
        component: null, // Will be loaded lazily
        componentLoader: getElegantPurpleTemplate,
        colors: {
            primary: '#7c3aed',
            secondary: '#8b5cf6',
            accent: '#a855f7'
        },
        tags: ['professional', 'purple', 'elegant', 'premium', 'sophisticated', 'logo'],
        compatibility: ['A4', 'Letter'],
        version: '1.0.0',
        isDefault: false
    }
};

// Template Categories
export const TEMPLATE_CATEGORIES = {
    all: 'All Templates',
    professional: 'Professional',
    modern: 'Modern',
    minimal: 'Minimal',
    creative: 'Creative'
};

// Template Factory - Factory pattern for creating template instances
export class TemplateFactory {
    /**
     * Get all available templates
     * @returns {Array} Array of template metadata
     */
    static getAllTemplates() {
        return Object.values(TEMPLATE_REGISTRY);
    }

    /**
     * Get template by ID
     * @param {string} templateId - Template ID
     * @returns {Object|null} Template metadata or null if not found
     */
    static getTemplate(templateId) {
        return TEMPLATE_REGISTRY[templateId] || null;
    }

    /**
 * Get template component by ID (async for lazy loading)
 * @param {string} templateId - Template ID
 * @returns {Promise<Function>|null} Template component promise or null if not found
 */
    static async getTemplateComponent(templateId) {
        console.log(`🔍 [TemplateFactory] === GETTING TEMPLATE COMPONENT ===`);
        console.log(`🎯 [TemplateFactory] Looking for template ID: "${templateId}"`);

        const template = TEMPLATE_REGISTRY[templateId];
        if (!template) {
            console.warn(`❌ [TemplateFactory] Template not found in registry: ${templateId}`);
            console.log(`📋 [TemplateFactory] Available templates:`, Object.keys(TEMPLATE_REGISTRY));
            console.log(`🔍 [TemplateFactory] Registry keys:`, Object.keys(TEMPLATE_REGISTRY).map(key => `"${key}"`));
            console.log(`🔍 [TemplateFactory] Requested template: "${templateId}" (length: ${templateId?.length})`);
            console.log(`🏁 [TemplateFactory] === COMPONENT NOT FOUND IN REGISTRY ===`);
            return null;
        }

        console.log(`✅ [TemplateFactory] Template found in registry:`, {
            id: template.id,
            name: template.name,
            hasComponent: !!template.component,
            hasLoader: !!template.componentLoader,
            componentType: typeof template.component,
            loaderType: typeof template.componentLoader
        });

        if (template.component) {
            console.log(`✅ [TemplateFactory] Using cached component for: ${templateId}`);
            console.log(`🔍 [TemplateFactory] Cached component type:`, typeof template.component);
            console.log(`🏁 [TemplateFactory] === RETURNING CACHED COMPONENT ===`);
            return template.component;
        }

        if (template.componentLoader) {
            console.log(`📦 [TemplateFactory] Loading component dynamically for: ${templateId}`);
            console.log(`🔧 [TemplateFactory] Loader type:`, typeof template.componentLoader);
            try {
                console.log(`🔄 [TemplateFactory] Executing component loader...`);
                template.component = await template.componentLoader();
                console.log(`✅ [TemplateFactory] Component loaded and cached for: ${templateId}`);
                console.log(`🔍 [TemplateFactory] Loaded component type:`, typeof template.component);
                console.log(`🏁 [TemplateFactory] === RETURNING DYNAMICALLY LOADED COMPONENT ===`);
                return template.component;
            } catch (error) {
                console.error(`❌ [TemplateFactory] Failed to load component for: ${templateId}`, error);
                console.error(`📋 [TemplateFactory] Loader error details:`, {
                    message: error.message,
                    stack: error.stack,
                    templateId
                });
                console.log(`🏁 [TemplateFactory] === DYNAMIC LOADING FAILED ===`);
                return null;
            }
        }

        console.warn(`⚠️ [TemplateFactory] No component or loader found for: ${templateId}`);
        console.log(`🔍 [TemplateFactory] Template object:`, template);
        console.log(`🏁 [TemplateFactory] === NO COMPONENT OR LOADER AVAILABLE ===`);
        return null;
    }

    /**
     * Get default template
     * @returns {Object} Default template metadata
     */
    static getDefaultTemplate() {
        return Object.values(TEMPLATE_REGISTRY).find(template => template.isDefault) ||
            Object.values(TEMPLATE_REGISTRY)[0];
    }

    /**
     * Get templates by category
     * @param {string} category - Template category
     * @returns {Array} Array of template metadata
     */
    static getTemplatesByCategory(category) {
        if (category === 'all') {
            return Object.values(TEMPLATE_REGISTRY);
        }
        return Object.values(TEMPLATE_REGISTRY).filter(template =>
            template.category.toLowerCase() === category.toLowerCase()
        );
    }

    /**
     * Search templates by tags
     * @param {Array} tags - Array of tags to search for
     * @returns {Array} Array of matching template metadata
     */
    static searchTemplatesByTags(tags) {
        return Object.values(TEMPLATE_REGISTRY).filter(template =>
            tags.some(tag => template.tags.includes(tag.toLowerCase()))
        );
    }

    /**
     * Get template colors
     * @param {string} templateId - Template ID
     * @returns {Object|null} Template colors or null if not found
     */
    static getTemplateColors(templateId) {
        const template = TEMPLATE_REGISTRY[templateId];
        return template ? template.colors : null;
    }

    /**
     * Create template instance with invoice data
     * @param {string} templateId - Template ID
     * @param {Object} invoiceData - Invoice data
     * @returns {Promise<JSX.Element|null>} Template component instance or null
     */
    static async createTemplate(templateId, invoiceData) {
        console.log(`🏭 [TemplateFactory] === CREATING TEMPLATE INSTANCE ===`);
        console.log(`🎯 [TemplateFactory] Template ID: "${templateId}"`);
        console.log(`📊 [TemplateFactory] Invoice data summary:`, {
            hasInvoiceNumber: !!invoiceData?.invoiceNumber,
            hasCompany: !!invoiceData?.company,
            hasCustomer: !!invoiceData?.customer,
            hasItems: !!invoiceData?.items,
            itemCount: invoiceData?.items?.length || 0,
            invoiceNumber: invoiceData?.invoiceNumber,
            companyName: invoiceData?.company?.companyName,
            customerName: invoiceData?.customer?.name
        });

        console.log(`🔍 [TemplateFactory] Getting template component for: ${templateId}`);
        const TemplateComponent = await this.getTemplateComponent(templateId);

        if (!TemplateComponent) {
            console.warn(`❌ [TemplateFactory] Template component not found for ID: "${templateId}"`);
            console.log(`🏁 [TemplateFactory] === TEMPLATE CREATION FAILED - NOT FOUND ===`);
            return null;
        }

        console.log(`✅ [TemplateFactory] Template component loaded successfully for: ${templateId}`);
        console.log(`🔍 [TemplateFactory] Component type:`, typeof TemplateComponent);
        console.log(`🔍 [TemplateFactory] Component name:`, TemplateComponent.name || 'Anonymous');

        try {
            console.log(`🎨 [TemplateFactory] Rendering template component...`);
            console.log(`🔧 [TemplateFactory] Calling component with invoice data...`);
            const renderedTemplate = TemplateComponent(invoiceData);
            console.log(`✅ [TemplateFactory] Template rendered successfully`);
            console.log(`🔍 [TemplateFactory] Rendered template type:`, typeof renderedTemplate);
            console.log(`🏁 [TemplateFactory] === TEMPLATE CREATION COMPLETED SUCCESSFULLY ===`);
            return renderedTemplate;
        } catch (error) {
            console.error(`❌ [TemplateFactory] === TEMPLATE RENDERING FAILED ===`);
            console.error(`❌ [TemplateFactory] Error creating template "${templateId}":`, error);
            console.error(`📋 [TemplateFactory] Error details:`, {
                message: error.message,
                stack: error.stack,
                templateId,
                componentType: typeof TemplateComponent
            });
            console.log(`🏁 [TemplateFactory] === TEMPLATE CREATION FAILED - RENDER ERROR ===`);
            return null;
        }
    }

    /**
     * Validate template compatibility
     * @param {string} templateId - Template ID
     * @param {string} pageSize - Page size (A4, Letter, etc.)
     * @returns {boolean} True if compatible
     */
    static isTemplateCompatible(templateId, pageSize = 'A4') {
        const template = TEMPLATE_REGISTRY[templateId];
        return template ? template.compatibility.includes(pageSize) : false;
    }

    /**
     * Get template preview URL
     * @param {string} templateId - Template ID
     * @returns {string|null} Preview URL or null if not found
     */
    static getTemplatePreview(templateId) {
        const template = TEMPLATE_REGISTRY[templateId];
        return template ? template.preview : null;
    }

    /**
     * Register a new template (for dynamic template loading)
     * @param {string} templateId - Template ID
     * @param {Object} templateMetadata - Template metadata
     */
    static registerTemplate(templateId, templateMetadata) {
        if (TEMPLATE_REGISTRY[templateId]) {
            console.warn(`Template "${templateId}" already exists. Overwriting...`);
        }

        TEMPLATE_REGISTRY[templateId] = {
            id: templateId,
            ...templateMetadata,
            version: templateMetadata.version || '1.0.0',
            isDefault: templateMetadata.isDefault || false
        };
    }

    /**
     * Unregister a template
     * @param {string} templateId - Template ID
     * @returns {boolean} True if successfully removed
     */
    static unregisterTemplate(templateId) {
        if (TEMPLATE_REGISTRY[templateId]) {
            delete TEMPLATE_REGISTRY[templateId];
            return true;
        }
        return false;
    }

    /**
     * Get template statistics
     * @returns {Object} Template statistics
     */
    static getTemplateStats() {
        const templates = Object.values(TEMPLATE_REGISTRY);
        const categories = {};

        templates.forEach(template => {
            const category = template.category;
            categories[category] = (categories[category] || 0) + 1;
        });

        return {
            total: templates.length,
            categories,
            defaultTemplate: this.getDefaultTemplate()?.id,
            versions: templates.map(t => ({ id: t.id, version: t.version }))
        };
    }
}

// Export default template ID for easy access
export const DEFAULT_TEMPLATE_ID = TemplateFactory.getDefaultTemplate().id;

// Export template helpers
export const TemplateHelpers = {
    /**
     * Format template name for display
     * @param {string} templateId - Template ID
     * @returns {string} Formatted template name
     */
    formatTemplateName(templateId) {
        const template = TemplateFactory.getTemplate(templateId);
        return template ? template.name : 'Unknown Template';
    },

    /**
     * Get template color scheme for UI
     * @param {string} templateId - Template ID
     * @returns {Object} Color scheme object
     */
    getColorScheme(templateId) {
        const colors = TemplateFactory.getTemplateColors(templateId);
        return colors ? {
            primary: colors.primary,
            secondary: colors.secondary,
            accent: colors.accent,
            text: '#000000',
            background: '#ffffff'
        } : null;
    },

    /**
     * Check if template is premium (for future premium features)
     * @param {string} templateId - Template ID
     * @returns {boolean} True if premium template
     */
    isPremiumTemplate(templateId) {
        const template = TemplateFactory.getTemplate(templateId);
        return template ? (template.isPremium || false) : false;
    },

    /**
     * Get recommended templates based on current selection
     * @param {string} currentTemplateId - Current template ID
     * @returns {Array} Array of recommended template IDs
     */
    getRecommendedTemplates(currentTemplateId) {
        const current = TemplateFactory.getTemplate(currentTemplateId);
        if (!current) return [];

        // Simple recommendation based on category and tags
        return TemplateFactory.getAllTemplates()
            .filter(template =>
                template.id !== currentTemplateId &&
                (template.category === current.category ||
                    template.tags.some(tag => current.tags.includes(tag)))
            )
            .slice(0, 3)
            .map(template => template.id);
    }
};

export default TemplateFactory;