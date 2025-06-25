import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Import template system
import { TemplateFactory } from './InvoiceTemplates/TemplateRegistry';
import { ConfigurationManager } from './InvoiceTemplates/ConfigurationManager';

// Register custom fonts for better typography
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.woff2' },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.woff2', fontWeight: 'bold' },
    ],
});

/**
 * Generate Invoice PDF using the selected template from ConfigurationManager
 * This function now acts as a template selector and factory
 * @param {Object} invoice - Invoice data
 * @returns {JSX.Element} PDF Document component
 */
export const generateInvoicePDF = (invoice) => {
    try {
        // Get current template configuration
        const selectedTemplateId = ConfigurationManager.getSelectedTemplate();

        // Log template selection for debugging
        console.log(`Generating PDF with template: ${selectedTemplateId}`);

        // Create template using factory pattern
        const templateComponent = TemplateFactory.createTemplate(selectedTemplateId, invoice);

        if (!templateComponent) {
            console.error(`Failed to create template with ID: ${selectedTemplateId}`);
            // Fallback to default template
            const defaultTemplate = TemplateFactory.getDefaultTemplate();
            console.log(`Falling back to default template: ${defaultTemplate.id}`);
            return TemplateFactory.createTemplate(defaultTemplate.id, invoice);
        }

        return templateComponent;
    } catch (error) {
        console.error('Error generating PDF:', error);

        // Ultimate fallback - use default template directly
        try {
            const defaultTemplate = TemplateFactory.getDefaultTemplate();
            return TemplateFactory.createTemplate(defaultTemplate.id, invoice);
        } catch (fallbackError) {
            console.error('Fallback template creation failed:', fallbackError);

            // Return a basic error document as last resort
            return (
                <Document>
                    <Page size="A4" style={{ padding: 30 }}>
                        <View>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 20 }}>
                                Error Generating Invoice
                            </Text>
                            <Text style={{ fontSize: 12, color: '#666' }}>
                                Unable to load invoice template. Please check your template configuration.
                            </Text>
                            <Text style={{ fontSize: 10, marginTop: 20, color: '#999' }}>
                                Invoice Number: {invoice?.invoiceNumber || 'N/A'}
                            </Text>
                        </View>
                    </Page>
                </Document>
            );
        }
    }
};

/**
 * Helper function to get available templates
 * @returns {Array} Array of available template metadata
 */
export const getAvailableTemplates = () => {
    return TemplateFactory.getAllTemplates();
};

/**
 * Helper function to get current template info
 * @returns {Object} Current template metadata
 */
export const getCurrentTemplate = () => {
    const templateId = ConfigurationManager.getSelectedTemplate();
    return TemplateFactory.getTemplate(templateId);
};

/**
 * Helper function to switch templates
 * @param {string} templateId - Template ID to switch to
 * @returns {boolean} True if successful
 */
export const switchTemplate = (templateId) => {
    return ConfigurationManager.setSelectedTemplate(templateId);
};

/**
 * Helper function to get template colors for UI previews
 * @param {string} templateId - Template ID (optional, uses current if not provided)
 * @returns {Object} Template color scheme
 */
export const getTemplateColors = (templateId = null) => {
    const id = templateId || ConfigurationManager.getSelectedTemplate();
    return TemplateFactory.getTemplateColors(id);
}; 