import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Import template system
import { TemplateFactory } from './InvoiceTemplates/TemplateRegistry';
import { ConfigurationManager } from './InvoiceTemplates/ConfigurationManager';
import { templateLogger } from '../../utils/templateLogger';

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
 * @returns {Promise<JSX.Element>} PDF Document component
 */
export const generateInvoicePDF = async (invoice) => {
    console.log('🚀 [generateInvoicePDF] === PDF GENERATION STARTED ===');
    console.log('📄 [generateInvoicePDF] Invoice data received:', {
        invoiceNumber: invoice?.invoiceNumber,
        companyName: invoice?.company?.companyName,
        customerName: invoice?.customer?.name || invoice?.customer?.customerName,
        itemCount: invoice?.items?.length,
        totalAmount: invoice?.totalAmount || invoice?.grandTotal,
        hasCompany: !!invoice?.company,
        hasCustomer: !!invoice?.customer,
        hasItems: !!invoice?.items
    });

    // Initialize flow tracking
    const flowTracker = templateLogger.trackPdfGenerationFlow(invoice);

    try {
        // Get current template configuration (async)
        console.log('🔍 [generateInvoicePDF] Fetching selected template from configuration...');
        const selectedTemplateId = await ConfigurationManager.getSelectedTemplate();
        console.log(`🎨 [generateInvoicePDF] Selected template ID: "${selectedTemplateId}"`);
        flowTracker.templateFetch(selectedTemplateId);

        // Create template using factory pattern (async)
        console.log('🏭 [generateInvoicePDF] Creating template component using factory...');
        console.log(`🔧 [generateInvoicePDF] Template factory will create: ${selectedTemplateId}`);
        const templateComponent = await TemplateFactory.createTemplate(selectedTemplateId, invoice);
        console.log('✅ [generateInvoicePDF] Template factory completed, result:', !!templateComponent);
        flowTracker.templateLoad(selectedTemplateId, !!templateComponent);

        if (!templateComponent) {
            console.error(`❌ [generateInvoicePDF] Template creation failed for ID: ${selectedTemplateId}`);
            templateLogger.warn('generateInvoicePDF', 'Template creation failed, using fallback', {
                failedTemplateId: selectedTemplateId
            });

            // Fallback to default template
            console.log('🔄 [generateInvoicePDF] Attempting fallback to default template...');
            const defaultTemplate = TemplateFactory.getDefaultTemplate();
            console.log(`🔄 [generateInvoicePDF] Default template: ${defaultTemplate.id}`);
            const fallbackComponent = await TemplateFactory.createTemplate(defaultTemplate.id, invoice);
            console.log('✅ [generateInvoicePDF] Fallback template created:', !!fallbackComponent);
            flowTracker.templateRender(defaultTemplate.id, !!fallbackComponent);
            flowTracker.complete(!!fallbackComponent);
            console.log('🏁 [generateInvoicePDF] === PDF GENERATION COMPLETED (FALLBACK) ===');
            return fallbackComponent;
        }

        console.log('✅ [generateInvoicePDF] Template component created successfully');
        console.log('🎨 [generateInvoicePDF] Template rendering completed');
        flowTracker.templateRender(selectedTemplateId, true);
        flowTracker.complete(true);
        templateLogger.success('generateInvoicePDF', 'PDF generation completed successfully', {
            templateId: selectedTemplateId,
            invoiceNumber: invoice?.invoiceNumber
        });

        console.log('🏁 [generateInvoicePDF] === PDF GENERATION COMPLETED SUCCESSFULLY ===');
        return templateComponent;
    } catch (error) {
        console.error('❌ [generateInvoicePDF] === PDF GENERATION FAILED ===');
        console.error('❌ [generateInvoicePDF] Error details:', {
            message: error.message,
            stack: error.stack,
            invoiceNumber: invoice?.invoiceNumber
        });

        templateLogger.error('generateInvoicePDF', 'PDF generation failed', error, {
            invoiceNumber: invoice?.invoiceNumber
        });

        // Ultimate fallback - use default template directly
        try {
            console.log('🆘 [generateInvoicePDF] Attempting ultimate fallback...');
            const defaultTemplate = TemplateFactory.getDefaultTemplate();
            console.log(`🆘 [generateInvoicePDF] Ultimate fallback template: ${defaultTemplate.id}`);
            const fallbackComponent = await TemplateFactory.createTemplate(defaultTemplate.id, invoice);
            console.log('✅ [generateInvoicePDF] Ultimate fallback succeeded:', !!fallbackComponent);
            flowTracker.complete(!!fallbackComponent, error);
            console.log('🏁 [generateInvoicePDF] === PDF GENERATION COMPLETED (ULTIMATE FALLBACK) ===');
            return fallbackComponent;
        } catch (fallbackError) {
            console.error('💥 [generateInvoicePDF] === ULTIMATE FALLBACK FAILED ===');
            console.error('💥 [generateInvoicePDF] Fallback error:', fallbackError);
            templateLogger.error('generateInvoicePDF', 'Fallback template creation failed', fallbackError);

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
 * @returns {Promise<Object>} Current template metadata
 */
export const getCurrentTemplate = async () => {
    const templateId = await ConfigurationManager.getSelectedTemplate();
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
 * @returns {Promise<Object>} Template color scheme
 */
export const getTemplateColors = async (templateId = null) => {
    const id = templateId || await ConfigurationManager.getSelectedTemplate();
    return TemplateFactory.getTemplateColors(id);
}; 