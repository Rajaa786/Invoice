import React, { useState, useEffect } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import {
    generateInvoicePDF,
    getAvailableTemplates,
    getCurrentTemplate,
    switchTemplate,
    getTemplateColors
} from './generateInvoicePDF';

/**
 * Template System Example Component
 * Demonstrates the integrated template system functionality
 */
const TemplateSystemExample = () => {
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [availableTemplates, setAvailableTemplates] = useState([]);
    const [previewMode, setPreviewMode] = useState(false);

    // Sample invoice data for demonstration
    const sampleInvoice = {
        invoiceNumber: "INV-2024-001",
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        company: {
            companyName: "Cypher Solutions",
            addressLine1: "123 Business Street",
            city: "Mumbai, Maharashtra 400001",
            gstin: "27ABCDE1234F1Z5"
        },
        customer: {
            name: "ABC Corporation",
            addressLine1: "456 Client Avenue, Delhi 110001"
        },
        items: [
            {
                details: "Web Development Services",
                hsn: "998311",
                quantity: 1,
                rate: 50000,
                per: "Service",
                amount: 50000
            },
            {
                details: "UI/UX Design Consultation",
                hsn: "998312",
                quantity: 8,
                rate: 2500,
                per: "Hour",
                amount: 20000
            }
        ],
        cgstRate: 9,
        sgstRate: 9,
        customerNotes: "Thank you for your business!"
    };

    useEffect(() => {
        // Load available templates
        const templates = getAvailableTemplates();
        setAvailableTemplates(templates);

        // Get current template
        const current = getCurrentTemplate();
        setSelectedTemplate(current);
    }, []);

    const handleTemplateChange = (templateId) => {
        const success = switchTemplate(templateId);
        if (success) {
            const newTemplate = getCurrentTemplate();
            setSelectedTemplate(newTemplate);
        }
    };

    const getTemplatePreview = (templateId) => {
        const colors = getTemplateColors(templateId);
        return (
            <div
                className="w-6 h-6 rounded border-2 border-gray-300"
                style={{
                    background: `linear-gradient(45deg, ${colors?.primary || '#000'}, ${colors?.secondary || '#333'})`
                }}
            />
        );
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    Invoice Template System Demo
                </h1>
                <p className="text-gray-600 mb-6">
                    This demonstrates the integrated template system that dynamically selects
                    and applies different invoice templates based on user configuration.
                </p>

                {/* Template Selection */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3">Available Templates</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {availableTemplates.map((template) => (
                            <div
                                key={template.id}
                                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${selectedTemplate?.id === template.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                onClick={() => handleTemplateChange(template.id)}
                            >
                                <div className="flex items-center space-x-3 mb-2">
                                    {getTemplatePreview(template.id)}
                                    <div>
                                        <h3 className="font-medium">{template.name}</h3>
                                        <span className="text-xs text-gray-500">{template.category}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                                <div className="flex flex-wrap gap-1">
                                    {template.features.slice(0, 3).map((feature, index) => (
                                        <span
                                            key={index}
                                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                                        >
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                                {selectedTemplate?.id === template.id && (
                                    <div className="mt-2">
                                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                            Currently Selected
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Current Template Info */}
                {selectedTemplate && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold mb-2">Current Template: {selectedTemplate.name}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Category:</span>
                                <p className="text-gray-600">{selectedTemplate.category}</p>
                            </div>
                            <div>
                                <span className="font-medium">Version:</span>
                                <p className="text-gray-600">{selectedTemplate.version}</p>
                            </div>
                            <div>
                                <span className="font-medium">Colors:</span>
                                <div className="flex space-x-1 mt-1">
                                    <div
                                        className="w-4 h-4 rounded border"
                                        style={{ backgroundColor: selectedTemplate.colors.primary }}
                                        title="Primary"
                                    />
                                    <div
                                        className="w-4 h-4 rounded border"
                                        style={{ backgroundColor: selectedTemplate.colors.secondary }}
                                        title="Secondary"
                                    />
                                    <div
                                        className="w-4 h-4 rounded border"
                                        style={{ backgroundColor: selectedTemplate.colors.accent }}
                                        title="Accent"
                                    />
                                </div>
                            </div>
                            <div>
                                <span className="font-medium">Features:</span>
                                <p className="text-gray-600">{selectedTemplate.features.length} features</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* PDF Actions */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <PDFDownloadLink
                        document={generateInvoicePDF(sampleInvoice)}
                        fileName={`invoice-${selectedTemplate?.name.toLowerCase().replace(/\s+/g, '-')}-demo.pdf`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                        {({ blob, url, loading, error }) =>
                            loading ? 'Generating PDF...' : 'Download Sample Invoice'
                        }
                    </PDFDownloadLink>

                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                        {previewMode ? 'Hide Preview' : 'Show Preview'}
                    </button>
                </div>

                {/* PDF Preview */}
                {previewMode && (
                    <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-100 px-4 py-2 border-b">
                            <h3 className="font-medium">PDF Preview - {selectedTemplate?.name}</h3>
                        </div>
                        <div style={{ height: '600px' }}>
                            <PDFViewer width="100%" height="100%">
                                {generateInvoicePDF(sampleInvoice)}
                            </PDFViewer>
                        </div>
                    </div>
                )}

                {/* Technical Info */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">🚀 Template System Features</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>✅ <strong>Dynamic Template Loading:</strong> Templates are loaded based on ConfigurationManager settings</li>
                        <li>✅ <strong>Factory Pattern:</strong> TemplateFactory creates instances dynamically</li>
                        <li>✅ <strong>Fallback System:</strong> Graceful fallback to default template on errors</li>
                        <li>✅ <strong>LocalStorage Persistence:</strong> Template selection is saved and restored</li>
                        <li>✅ <strong>Event-Driven Architecture:</strong> Real-time updates when templates change</li>
                        <li>✅ <strong>Color System Integration:</strong> Each template has its own color scheme</li>
                        <li>✅ <strong>Error Handling:</strong> Comprehensive error handling with fallbacks</li>
                        <li>✅ <strong>React-PDF Integration:</strong> Seamless integration with @react-pdf/renderer</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TemplateSystemExample; 