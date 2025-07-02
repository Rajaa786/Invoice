import React, { useState, useEffect } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { generateInvoicePDF } from './generateInvoicePDF';

// Sample invoice data for demonstration
const sampleInvoiceData = {
    invoiceNumber: "INV-2024-001",
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    cgstRate: 9,
    sgstRate: 9,
    company: {
        companyName: "CypherSol Technologies",
        addressLine1: "123 Tech Park, Innovation Drive",
        city: "Bangalore, Karnataka - 560001",
        gstin: "29ABCDE1234F1Z5"
    },
    customer: {
        name: "ABC Corporation Ltd.",
        addressLine1: "456 Business Street, Corporate Plaza, Mumbai - 400001"
    },
    items: [
        {
            details: "Website Development Services",
            hsn: "998314",
            quantity: 1,
            rate: 50000,
            per: "Project",
            amount: 50000
        },
        {
            details: "Mobile App Development",
            hsn: "998314",
            quantity: 1,
            rate: 75000,
            per: "Project",
            amount: 75000
        },
        {
            details: "Digital Marketing Campaign",
            hsn: "998399",
            quantity: 3,
            rate: 15000,
            per: "Month",
            amount: 45000
        }
    ],
    customerNotes: "Thank you for your business! Payment terms: Net 30 days. Please include invoice number with payment.",
    signature: null // You can add a base64 image string here for signature
};

const InvoicePDFExample = () => {
    const [showPreview, setShowPreview] = useState(false);
    const [pdfDocument, setPdfDocument] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPdfDocument = async () => {
            try {
                setIsLoading(true);
                const document = await generateInvoicePDF(sampleInvoiceData);
                setPdfDocument(document);
            } catch (error) {
                console.error('Error loading PDF document:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPdfDocument();
    }, []);

    if (isLoading) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading PDF template...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Beautiful Invoice PDF Generator
                </h2>

                <div className="space-y-4">
                    <p className="text-gray-600">
                        This demonstrates the new react-pdf invoice generator with professional styling and layout.
                    </p>

                    <div className="flex gap-4 flex-wrap">
                        {/* Download PDF Button */}
                        {pdfDocument && (
                            <PDFDownloadLink
                                document={pdfDocument}
                                fileName={`invoice-${sampleInvoiceData.invoiceNumber}.pdf`}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {({ blob, url, loading, error }) =>
                                    loading ? 'Generating PDF...' : 'Download Invoice PDF'
                                }
                            </PDFDownloadLink>
                        )}

                        {/* Toggle Preview Button */}
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                            disabled={!pdfDocument}
                        >
                            {showPreview ? 'Hide Preview' : 'Show Preview'}
                        </button>
                    </div>

                    {/* PDF Preview */}
                    {showPreview && pdfDocument && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-4">Invoice Preview:</h3>
                            <div className="border border-gray-300 rounded-lg overflow-hidden" style={{ height: '600px' }}>
                                <PDFViewer
                                    style={{ width: '100%', height: '100%' }}
                                    showToolbar={true}
                                >
                                    {pdfDocument}
                                </PDFViewer>
                            </div>
                        </div>
                    )}

                    {/* Features List */}
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">Features:</h3>
                        <ul className="space-y-2 text-gray-600">
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                Professional header with company branding
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                Elegant color scheme and typography
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                Responsive table layout with alternating row colors
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                Automatic tax calculations (CGST/SGST)
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                Amount in words conversion
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                Digital signature support
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                Professional declaration and footer
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoicePDFExample; 