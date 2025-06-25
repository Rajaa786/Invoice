import ClassicBlueTemplate from './ClassicBlueTemplate';
import ModernGreenTemplate from './ModernGreenTemplate';
import MinimalWhiteTemplate from './MinimalWhiteTemplate';

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
            'Professional appearance'
        ],
        preview: '/images/templates/classic-blue-preview.png', // We'll create this later
        component: ClassicBlueTemplate,
        colors: {
            primary: '#1e3a8a',
            secondary: '#3b82f6',
            accent: '#10b981'
        },
        tags: ['professional', 'blue', 'elegant', 'corporate'],
        compatibility: ['A4', 'Letter'],
        version: '1.0.0',
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
            'Contemporary styling'
        ],
        preview: '/images/templates/modern-green-preview.png',
        component: ModernGreenTemplate,
        colors: {
            primary: '#16a34a',
            secondary: '#22c55e',
            accent: '#84cc16'
        },
        tags: ['modern', 'green', 'fresh', 'vibrant', 'cards'],
        compatibility: ['A4', 'Letter'],
        version: '1.0.0',
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
            'Distraction-free'
        ],
        preview: '/images/templates/minimal-white-preview.png',
        component: MinimalWhiteTemplate,
        colors: {
            primary: '#000000',
            secondary: '#333333',
            accent: '#666666'
        },
        tags: ['minimal', 'clean', 'simple', 'black-white', 'basic'],
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
     * Get template component by ID
     * @param {string} templateId - Template ID
     * @returns {Function|null} Template component or null if not found
     */
    static getTemplateComponent(templateId) {
        const template = TEMPLATE_REGISTRY[templateId];
        return template ? template.component : null;
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
     * @returns {JSX.Element|null} Template component instance or null
     */
    static createTemplate(templateId, invoiceData) {
        const TemplateComponent = this.getTemplateComponent(templateId);
        if (!TemplateComponent) {
            console.warn(`Template with ID "${templateId}" not found`);
            return null;
        }

        try {
            return TemplateComponent(invoiceData);
        } catch (error) {
            console.error(`Error creating template "${templateId}":`, error);
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