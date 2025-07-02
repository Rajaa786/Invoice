import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '../ui/alert-dialog';
import {
    Settings,
    Palette,
    Download,
    Upload,
    RefreshCw,
    Eye,
    Check,
    Star,
    Zap,
    FileText,
    Monitor,
    Smartphone,
    Printer,
    Maximize,
    Maximize2,
    RotateCcw,
    Play,
    AlertCircle
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { PDFViewer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Import our template system
import { TemplateFactory, TEMPLATE_CATEGORIES } from '../Elements/InvoiceTemplates/TemplateRegistry';
import { ConfigurationManager, InvoiceConfigHelpers } from '../Elements/InvoiceTemplates/ConfigurationManager';
import Loader from '../Elements/Loader';
import ReactPerformanceMonitor from './ReactPerformanceMonitor';
import { templateLogger } from '../../utils/templateLogger';

// Simple test template for debugging
const createTestTemplate = (invoiceData) => {
    // Get dynamic settings from invoice data
    const pageSize = invoiceData?.pageSize || invoiceData?.templateSettings?.pageSize || 'A4';
    const fontSize = invoiceData?.templateSettings?.fontSize || 'normal';

    // Calculate font scale
    const getFontScale = () => {
        switch (fontSize) {
            case 'small': return 0.8;
            case 'large': return 1.2;
            case 'normal':
            default: return 1.0;
        }
    };

    const fontScale = getFontScale();

    const testStyles = StyleSheet.create({
        page: {
            flexDirection: 'column',
            backgroundColor: '#FFFFFF',
            padding: 30,
        },
        section: {
            margin: 10,
            padding: 10,
            flexGrow: 1,
        },
        title: {
            fontSize: 24 * fontScale,
            marginBottom: 10,
            textAlign: 'center',
            color: '#e74c3c',
        },
        text: {
            fontSize: 12 * fontScale,
            marginBottom: 5,
        },
        debugText: {
            fontSize: 10 * fontScale,
            marginBottom: 3,
            color: '#666',
        },
        warningText: {
            fontSize: 14 * fontScale,
            marginBottom: 10,
            color: '#e74c3c',
            textAlign: 'center',
            backgroundColor: '#fff2f0',
            padding: 10,
        }
    });

    return (
        <Document>
            <Page size={pageSize} style={testStyles.page}>
                <View style={testStyles.section}>
                    <Text style={testStyles.warningText}>⚠️ FALLBACK TEST TEMPLATE ⚠️</Text>
                    <Text style={testStyles.title}>TEST INVOICE</Text>

                    <Text style={testStyles.debugText}>--- PREVIEW SETTINGS ---</Text>
                    <Text style={testStyles.debugText}>Page Size: {pageSize}</Text>
                    <Text style={testStyles.debugText}>Font Size: {fontSize} (scale: {fontScale})</Text>
                    <Text style={testStyles.debugText}>Template Settings: {invoiceData?.templateSettings ? 'Present' : 'Missing'}</Text>

                    <Text style={testStyles.debugText}>--- INVOICE DATA ---</Text>
                    <Text style={testStyles.text}>Invoice Number: {invoiceData?.invoiceNumber || 'TEST-001'}</Text>
                    <Text style={testStyles.text}>Company: {invoiceData?.company?.companyName || 'Test Company'}</Text>
                    <Text style={testStyles.text}>Customer: {invoiceData?.customer?.name || 'Test Customer'}</Text>
                    <Text style={testStyles.text}>Date: {invoiceData?.invoiceDate || new Date().toLocaleDateString()}</Text>
                    <Text style={testStyles.text}>Items: {invoiceData?.items?.length || 0}</Text>
                    <Text style={testStyles.text}>Total: ₹{invoiceData?.grandTotal || '0.00'}</Text>

                    <Text style={testStyles.debugText}>--- TEMPLATE DEBUG ---</Text>
                    <Text style={testStyles.debugText}>This test template proves that:</Text>
                    <Text style={testStyles.debugText}>• PDFViewer can render PDF components</Text>
                    <Text style={testStyles.debugText}>• Page size changes work: {pageSize}</Text>
                    <Text style={testStyles.debugText}>• Font scaling works: {fontScale}x</Text>
                    <Text style={testStyles.debugText}>• Data is being passed correctly</Text>
                </View>
            </Page>
        </Document>
    );
};

// Sample invoice data for preview - Fixed to match template expectations exactly
const SAMPLE_INVOICE_DATA = {
    invoiceNumber: 'INV-2024-001',
    invoiceDate: new Date().toLocaleDateString('en-GB'),  // ✅ Fixed: was 'date', now 'invoiceDate'
    date: new Date().toLocaleDateString('en-GB'),  // Keep both for compatibility
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),

    // Company info - matches template expectations
    company: {
        companyName: 'Cyphersol Fintech India Pvt. Ltd.',
        logo: '/cyphersol-logo.png',  // Add logo path
        addressLine1: '123 Business Street',
        city: 'Business City',
        state: 'BC',
        zip: '12345',
        phone: '+1 (555) 123-4567',
        email: 'hello@yourcompany.com',
        website: 'www.yourcompany.com',
        gstin: 'GST123456789012345'
    },

    // Customer info - Fixed to match template expectations
    customer: {
        name: 'Customer Company Ltd.',  // ✅ Fixed: was 'customerName', now 'name'
        customerName: 'Customer Company Ltd.',  // Keep both for compatibility
        contactPerson: 'John Smith',
        addressLine1: '456 Client Avenue',
        city: 'Client City',
        state: 'CC',
        zip: '67890',
        phone: '+1 (555) 987-6543',
        email: 'john@customer.com'
    },

    // Items - Fixed to match template field names
    items: [
        {
            id: 1,
            details: 'Professional Consulting Services',  // ✅ Added 'details' field
            description: 'Professional Consulting Services',  // Keep both for compatibility
            name: 'Professional Consulting Services',  // Keep both for compatibility
            hsn: '998314',  // ✅ Fixed: was 'hsnSac', now 'hsn'
            hsnSac: '998314',  // Keep both for compatibility
            quantity: 2,
            rate: 2000.00,
            amount: 4000.00,
            per: 'Nos'  // ✅ Added 'per' field for unit
        },
        {
            id: 2,
            details: 'Software Development Services',  // ✅ Added 'details' field
            description: 'Software Development Services',  // Keep both for compatibility
            name: 'Software Development Services',  // Keep both for compatibility
            hsn: '998313',  // ✅ Fixed: was 'hsnSac', now 'hsn'
            hsnSac: '998313',  // Keep both for compatibility
            quantity: 1,
            rate: 1500.00,
            amount: 1500.00,
            per: 'Nos'  // ✅ Added 'per' field for unit
        },
        {
            id: 3,
            details: 'Software Development Services',  // ✅ Added 'details' field
            description: 'Software Development Services',  // Keep both for compatibility
            name: 'Software Development Services',  // Keep both for compatibility 
            hsn: '998312',  // ✅ Fixed: was 'hsnSac', now 'hsn'
            hsnSac: '998313',  // Keep both for compatibility
            quantity: 1,
            rate: 1500.00,
            amount: 1500.00,
            per: 'Nos'  // ✅ Added 'per' field for unit
        },
        {
            id: 4,
            details: 'Software Development Services',  // ✅ Added 'details' field
            description: 'Software Development Services',  // Keep both for compatibility
            name: 'Software Development Services',  // Keep both for compatibility 
            hsn: '998312',  // ✅ Fixed: was 'hsnSac', now 'hsn'
            hsnSac: '998313',  // Keep both for compatibility
            quantity: 1,
            rate: 1500.00,
            amount: 1500.00,
            per: 'Nos'  // ✅ Added 'per' field for unit
        },
        {
            id: 5,
            details: 'Software Development Services',  // ✅ Added 'details' field
            description: 'Software Development Services',  // Keep both for compatibility
            name: 'Software Development Services',  // Keep both for compatibility 
            hsn: '998312',  // ✅ Fixed: was 'hsnSac', now 'hsn'
            hsnSac: '998313',  // Keep both for compatibility
            quantity: 1,
            rate: 1500.00,
            amount: 1500.00,
            per: 'Nos'  // ✅ Added 'per' field for unit
        },
        {
            id: 4,
            details: 'Software Development Services',  // ✅ Added 'details' field
            description: 'Software Development Services',  // Keep both for compatibility
            name: 'Software Development Services',  // Keep both for compatibility 
            hsn: '998312',  // ✅ Fixed: was 'hsnSac', now 'hsn'
            hsnSac: '998313',  // Keep both for compatibility
            quantity: 1,
            rate: 1500.00,
            amount: 1500.00,
            per: 'Nos'  // ✅ Added 'per' field for unit
        },
        // {
        //     id: 6,
        //     details: 'Software Development Services',  // ✅ Added 'details' field
        //     description: 'Software Development Services',  // Keep both for compatibility
        //     name: 'Software Development Services',  // Keep both for compatibility 
        //     hsn: '998312',  // ✅ Fixed: was 'hsnSac', now 'hsn'
        //     hsnSac: '998313',  // Keep both for compatibility
        //     quantity: 1,
        //     rate: 1500.00,
        //     amount: 1500.00,
        //     per: 'Nos'  // ✅ Added 'per' field for unit
        // },
        // {
        //     id: 7,
        //     details: 'Software Development Services',  // ✅ Added 'details' field
        //     description: 'Software Development Services',  // Keep both for compatibility
        //     name: 'Software Development Services',  // Keep both for compatibility 
        //     hsn: '998312',  // ✅ Fixed: was 'hsnSac', now 'hsn'
        //     hsnSac: '998313',  // Keep both for compatibility
        //     quantity: 1,
        //     rate: 1500.00,
        //     amount: 1500.00,
        //     per: 'Nos'  // ✅ Added 'per' field for unit
        // },
        // {
        //     id: 8,
        //     details: 'Software Development Services',  // ✅ Added 'details' field
        //     description: 'Software Development Services',  // Keep both for compatibility
        //     name: 'Software Development Services',  // Keep both for compatibility 
        //     hsn: '998312',  // ✅ Fixed: was 'hsnSac', now 'hsn'
        //     hsnSac: '998313',  // Keep both for compatibility
        //     quantity: 1,
        //     rate: 1500.00,
        //     amount: 1500.00,
        //     per: 'Nos'  // ✅ Added 'per' field for unit
        // },
        // {
        //     id: 9,
        //     details: 'Software Development Services',  // ✅ Added 'details' field
        //     description: 'Software Development Services',  // Keep both for compatibility
        //     name: 'Software Development Services',  // Keep both for compatibility 
        //     hsn: '998312',  // ✅ Fixed: was 'hsnSac', now 'hsn'
        //     hsnSac: '998313',  // Keep both for compatibility
        //     quantity: 1,
        //     rate: 1500.00,
        //     amount: 1500.00,
        //     per: 'Nos'  // ✅ Added 'per' field for unit
        // },
        // {
        //     id: 10,
        //     details: 'Software Development Services',  // ✅ Added 'details' field
        //     description: 'Software Development Services',  // Keep both for compatibility
        //     name: 'Software Development Services',  // Keep both for compatibility 
        //     hsn: '998312',  // ✅ Fixed: was 'hsnSac', now 'hsn'
        //     hsnSac: '998313',  // Keep both for compatibility
        //     quantity: 1,
        //     rate: 1500.00,
        //     amount: 1500.00,
        //     per: 'Nos'  // ✅ Added 'per' field for unit
        // }
    ],

    // Tax calculations - matching template structure
    subtotal: 5500.00,
    cgstRate: 9,
    sgstRate: 9,
    cgstAmount: 495.00,
    sgstAmount: 495.00,
    grandTotal: 6490.00,

    notes: 'Thank you for your business! Payment is due within 30 days.',
    customerNotes: 'Thank you for your business! Payment is due within 30 days.',  // ✅ Added customerNotes
    paymentTerms: 'Net 30',

    currency: 'INR'
};

// 🔧 FIXED: Stable debounce utility outside component
const createDebouncedFunction = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// 🔧 TESTING: Temporarily remove React.memo to isolate the issue
const InvoiceTemplateSettings = ({ onClose }) => {
    const { toast } = useToast();

    // 🔧 PERFORMANCE: Simplified render tracking without useEffect
    const renderCountRef = useRef(0);
    renderCountRef.current += 1;

    // Simple console log without useEffect to avoid any render triggers
    if (process.env.NODE_ENV === 'development' && renderCountRef.current % 10 === 0) {
        console.log(`[InvoiceTemplateSettings] Render #${renderCountRef.current}`);
    }

    // Loading and initialization state
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // Template settings state
    const [selectedTemplate, setSelectedTemplate] = useState('classic_blue');
    const [templateSettings, setTemplateSettings] = useState({
        pageSize: 'A4',
        orientation: 'portrait',
        fontSize: 'normal',
        margins: 'normal',
        showPreviewBeforeDownload: true,
        autoGeneratePDF: true,
        includeTaxBreakdown: true,
        showItemCodes: true,
        colorScheme: 'default'
    });

    // UI state
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [previewTemplate, setPreviewTemplate] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Preview state
    const [previewMode, setPreviewMode] = useState('desktop');
    const [previewPageSize, setPreviewPageSize] = useState('A4');
    const [previewFontSize, setPreviewFontSize] = useState('normal');
    const [showPreviewPanel, setShowPreviewPanel] = useState(true);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    // Template data - FIXED: Use memoized static reference
    const templates = useMemo(() => {
        console.log('[DEBUG] Creating templates array');
        return TemplateFactory.getAllTemplates();
    }, []);

    const [filteredTemplates, setFilteredTemplates] = useState([]);

    // 🔧 FIXED: Stable refs to prevent recreating functions
    const saveTimeoutRef = useRef(null);
    const toastRef = useRef(toast);

    // Update toast ref when it changes
    useEffect(() => {
        toastRef.current = toast;
    }, [toast]);

    // Initialize filtered templates once
    useEffect(() => {
        console.log('[DEBUG] Initializing filteredTemplates');
        setFilteredTemplates(templates);
    }, [templates]);

    const pageSizeOptions = useMemo(() => [
        { value: 'A4', label: 'A4 (210×297mm)' },
        { value: 'Letter', label: 'Letter (8.5×11in)' },
        { value: 'Legal', label: 'Legal (8.5×14in)' }
    ], []);

    const orientationOptions = useMemo(() => [
        { value: 'portrait', label: 'Portrait' },
        { value: 'landscape', label: 'Landscape' }
    ], []);

    const fontSizeOptions = useMemo(() => [
        { value: 'small', label: 'Small' },
        { value: 'normal', label: 'Normal' },
        { value: 'large', label: 'Large' }
    ], []);

    const marginOptions = useMemo(() => [
        { value: 'narrow', label: 'Narrow' },
        { value: 'normal', label: 'Normal' },
        { value: 'wide', label: 'Wide' }
    ], []);

    const colorSchemeOptions = useMemo(() => [
        { value: 'default', label: 'Default' },
        { value: 'blue', label: 'Blue' },
        { value: 'green', label: 'Green' },
        { value: 'purple', label: 'Purple' }
    ], []);

    // 🔧 FIXED: Stable debounced save function with ref-based toast
    const debouncedSaveSettings = useMemo(() =>
        createDebouncedFunction(async (newSettings) => {
            try {
                console.log('[InvoiceTemplateSettings] Saving settings:', newSettings);
                setSaving(true);
                const success = await ConfigurationManager.setTemplateSettings(newSettings);

                if (success) {
                    console.log('[InvoiceTemplateSettings] Settings saved successfully');
                    toastRef.current({
                        title: "Success",
                        description: "Template settings saved successfully"
                    });
                } else {
                    throw new Error('Failed to save settings');
                }
            } catch (error) {
                console.error('[InvoiceTemplateSettings] Error saving settings:', error);
                toastRef.current({
                    title: "Error",
                    description: "Failed to save template settings",
                    variant: "destructive"
                });
            } finally {
                setSaving(false);
            }
        }, 500),
        []); // 🔧 FIXED: Empty dependency array - function is now stable!

    // Load initial settings only once
    useEffect(() => {
        if (initialized) return;

        const loadSettings = async () => {
            try {
                console.log('[InvoiceTemplateSettings] Loading initial settings...');
                setLoading(true);

                const [template, settings] = await Promise.all([
                    ConfigurationManager.getSelectedTemplate(),
                    ConfigurationManager.getTemplateSettings()
                ]);

                console.log('[InvoiceTemplateSettings] Loaded settings:', { template, settings });

                setSelectedTemplate(template);
                setTemplateSettings(settings);
                setInitialized(true);

            } catch (error) {
                console.error('[InvoiceTemplateSettings] Error loading settings:', error);
                toastRef.current({
                    title: "Error",
                    description: "Failed to load template settings",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, [initialized, toastRef]);

    // Effect to filter templates
    useEffect(() => {
        let filtered = templates;

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = TemplateFactory.getTemplatesByCategory(selectedCategory);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(template =>
                template.name.toLowerCase().includes(query) ||
                template.description.toLowerCase().includes(query) ||
                template.tags.some(tag => tag.includes(query))
            );
        }

        setFilteredTemplates(filtered);
    }, [selectedCategory, searchQuery, templates]);

    // Handle template selection
    const handleTemplateChange = useCallback(async (templateId) => {
        const flowTracker = templateLogger.trackTemplateSelectionFlow(templateId);

        try {
            setSaving(true);

            // Optimistic update
            setSelectedTemplate(templateId);
            flowTracker.uiUpdate();

            const success = await ConfigurationManager.setSelectedTemplate(templateId);
            flowTracker.configSave(success);

            if (success) {
                templateLogger.success('InvoiceTemplateSettings', 'Template changed successfully', {
                    templateId,
                    templateName: TemplateFactory.getTemplate(templateId)?.name
                });

                toastRef.current({
                    title: "Success",
                    description: `Template changed to ${templateId}`
                });
                flowTracker.complete(true);
            } else {
                // Revert on failure
                const currentTemplate = await ConfigurationManager.getSelectedTemplate();
                setSelectedTemplate(currentTemplate);
                flowTracker.complete(false, new Error('Configuration save failed'));
                throw new Error('Failed to change template');
            }
        } catch (error) {
            templateLogger.error('InvoiceTemplateSettings', 'Template change failed', error, {
                templateId
            });

            toastRef.current({
                title: "Error",
                description: "Failed to change template",
                variant: "destructive"
            });
            flowTracker.complete(false, error);
        } finally {
            setSaving(false);
        }
    }, [toastRef]);

    // 🔧 FIXED: Handle settings updates without dependency on templateSettings
    const handleSettingUpdate = useCallback((key, value) => {
        console.log(`[InvoiceTemplateSettings] Updating ${key} to:`, value);

        // Optimistic update using functional setState to avoid dependency
        setTemplateSettings(prevSettings => {
            const newSettings = { ...prevSettings, [key]: value };

            // Debounced save with new settings
            debouncedSaveSettings(newSettings);

            return newSettings;
        });
    }, [debouncedSaveSettings]); // ✅ Now stable since debouncedSaveSettings is stable

    // Reset to defaults
    const handleReset = useCallback(async () => {
        try {
            setSaving(true);
            console.log('[InvoiceTemplateSettings] Resetting to defaults...');

            const success = await ConfigurationManager.resetConfiguration(['templateSettings']);

            if (success) {
                const [template, settings] = await Promise.all([
                    ConfigurationManager.getSelectedTemplate(),
                    ConfigurationManager.getTemplateSettings()
                ]);

                setSelectedTemplate(template);
                setTemplateSettings(settings);

                toastRef.current({
                    title: "Success",
                    description: "Template settings reset to defaults"
                });
            } else {
                throw new Error('Failed to reset settings');
            }
        } catch (error) {
            console.error('[InvoiceTemplateSettings] Error resetting settings:', error);
            toastRef.current({
                title: "Error",
                description: "Failed to reset template settings",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    }, [toastRef]);

    // Export configuration
    const handleExport = useCallback(async () => {
        try {
            const config = await ConfigurationManager.exportConfiguration();
            const blob = new Blob([config], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'invoice-template-settings.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toastRef.current({
                title: "Settings Exported",
                description: "Configuration exported successfully.",
            });
        } catch (error) {
            toastRef.current({
                title: "Export Failed",
                description: "Failed to export settings.",
                variant: "destructive",
            });
        }
    }, [toastRef]);

    // Import configuration
    const handleImport = useCallback((event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const success = await ConfigurationManager.importConfiguration(e.target.result);
                if (success) {
                    // Reload settings after import
                    const [template, settings] = await Promise.all([
                        ConfigurationManager.getSelectedTemplate(),
                        ConfigurationManager.getTemplateSettings()
                    ]);

                    setSelectedTemplate(template);
                    setTemplateSettings(settings);

                    toastRef.current({
                        title: "Settings Imported",
                        description: "Configuration imported successfully.",
                    });
                } else {
                    throw new Error('Invalid configuration file');
                }
            } catch (error) {
                toastRef.current({
                    title: "Import Failed",
                    description: "Failed to import settings. Please check the file format.",
                    variant: "destructive",
                });
            }
        };
        reader.readAsText(file);
    }, [toastRef]);

    // Preview template
    const handlePreview = (templateId) => {
        setPreviewTemplate(templateId);
        setPreviewPageSize(templateSettings.pageSize);
        setPreviewFontSize(templateSettings.fontSize);
        setIsPreviewOpen(true);
    };

    // Enhanced error boundary component with better debugging
    const TemplateErrorBoundary = ({ children }) => {
        const [hasError, setHasError] = useState(false);
        const [errorDetails, setErrorDetails] = useState(null);

        useEffect(() => {
            setHasError(false);
            setErrorDetails(null);
        }, [children]);

        const handleError = (error) => {
            console.error('❌ [TemplateErrorBoundary] Template rendering error:', error);
            console.error('📋 [TemplateErrorBoundary] Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                componentStack: error.componentStack
            });
            setHasError(true);
            setErrorDetails(error);
            templateLogger.error('TemplateErrorBoundary', 'Template rendering failed', error);
        };

        // React Error Boundary methods
        const componentDidCatch = (error, errorInfo) => {
            console.error('❌ [TemplateErrorBoundary] React Error Boundary caught error:', error, errorInfo);
            handleError(error);
        };

        if (hasError) {
            return (
                <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg border-2 border-red-200">
                    <div className="text-center p-6">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                        <p className="text-red-700 font-medium mb-2">Template Rendering Error</p>
                        <p className="text-red-600 text-sm mb-2">
                            {errorDetails?.message || 'There was an issue rendering this template with the current settings.'}
                        </p>
                        {process.env.NODE_ENV === 'development' && (
                            <details className="mt-3 text-left bg-red-100 p-2 rounded text-xs">
                                <summary className="cursor-pointer font-medium text-red-800">Debug Info</summary>
                                <pre className="mt-2 whitespace-pre-wrap text-red-700">
                                    {errorDetails?.stack || 'No stack trace available'}
                                </pre>
                            </details>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => {
                                console.log('🔄 [TemplateErrorBoundary] Retrying template render');
                                setHasError(false);
                                setErrorDetails(null);
                            }}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </div>
            );
        }

        try {
            return children;
        } catch (error) {
            handleError(error);
            return null;
        }
    };

    // Template preview component - Using actual invoice templates
    const TemplatePreview = ({ templateId, settings, mode, previewPageSize, previewFontSize }) => {
        const [isLoading, setIsLoading] = useState(true);
        const [templateComponent, setTemplateComponent] = useState(null);
        const template = TemplateFactory.getTemplate(templateId);
        const containerRef = useRef(null);

        useEffect(() => {
            const loadTemplate = async () => {
                console.log(`🔍 [TemplatePreview] Loading template "${templateId}" with settings:`, {
                    templateId,
                    pageSize: previewPageSize,
                    fontSize: previewFontSize,
                    orientation: settings.orientation
                });

                setIsLoading(true);

                // Create preview data outside try block to avoid scope issues
                const previewData = {
                    ...SAMPLE_INVOICE_DATA,
                    templateSettings: {
                        ...settings,
                        pageSize: previewPageSize,
                        fontSize: previewFontSize
                    },
                    pageSize: previewPageSize,
                    orientation: settings.orientation
                };

                console.log('📄 [TemplatePreview] Preview Data:', {
                    company: previewData.company,
                    logo: previewData.company?.logo,
                    settings: previewData.templateSettings
                });

                try {
                    console.log('🏭 [TemplatePreview] Creating template...');
                    let component = await TemplateFactory.createTemplate(templateId, previewData);

                    if (component) {
                        console.log('✅ [TemplatePreview] Template component created successfully');
                        setTemplateComponent(component);
                    } else {
                        console.warn('⚠️ [TemplatePreview] Template component is null, using test template as fallback');
                        setTemplateComponent(createTestTemplate(previewData));
                    }
                } catch (error) {
                    console.error('❌ [TemplatePreview] Error loading template:', error);
                    setTemplateComponent(createTestTemplate(previewData));
                    templateLogger.error('TemplatePreview', 'Failed to load template', error);
                } finally {
                    setIsLoading(false);
                }
            };

            loadTemplate();
        }, [templateId, settings, previewPageSize, previewFontSize]);

        if (!template) {
            return (
                <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
                    <div className="text-center">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-gray-500">Template not found</p>
                        <p className="text-xs text-gray-400 mt-2">Template ID: {templateId}</p>
                    </div>
                </div>
            );
        }

        const getPreviewStyles = () => {
            const baseStyles = {
                height: '100%',
                transition: 'all 0.3s ease'
            };

            switch (mode) {
                case 'mobile':
                    return {
                        ...baseStyles,
                        width: '375px',
                        margin: '0 auto'
                    };
                case 'print':
                    return {
                        ...baseStyles,
                        width: settings.pageSize === 'A4' ? '794px' : '816px',
                        margin: '0 auto'
                    };
                default: // desktop
                    return {
                        ...baseStyles,
                        width: '100%'
                    };
            }
        };

        return (
            <div className="preview-container w-full h-full bg-gray-100 rounded-lg overflow-hidden">
                <div className="h-full flex justify-center items-center">
                    <div
                        ref={containerRef}
                        className="preview-content bg-white rounded-lg shadow-sm w-full h-full overflow-hidden"
                        style={getPreviewStyles()}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader />
                            </div>
                        ) : templateComponent ? (
                            <div className="w-full h-full">
                                <PDFViewer
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none'
                                    }}
                                    showToolbar={true}
                                >
                                    {templateComponent}
                                </PDFViewer>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center text-gray-500">
                                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                                    <p>Failed to load template preview</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Template Info Footer */}
                <div className="mt-4 text-center text-xs text-gray-500">
                    <p>
                        {template.name} • {mode.charAt(0).toUpperCase() + mode.slice(1)} View •
                        {settings.pageSize} • {settings.orientation}
                    </p>
                </div>
            </div>
        );
    };

    // Mini template preview component for cards
    const MiniTemplatePreview = ({ template }) => {
        return (
            <div
                className="relative bg-white rounded border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                style={{ height: '120px', fontSize: '6px' }}
            >
                {/* Mini Header */}
                <div
                    className="h-4 flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: template.colors.primary, fontSize: '4px' }}
                >
                    INVOICE
                </div>

                {/* Mini Content */}
                <div className="p-1 space-y-1">
                    {/* Company section */}
                    <div
                        className="h-3 rounded"
                        style={{ backgroundColor: template.colors.background || '#f8f9fa' }}
                    />

                    {/* Items table simulation */}
                    <div className="space-y-0.5">
                        <div
                            className="h-2 rounded"
                            style={{ backgroundColor: template.colors.primary, opacity: 0.8 }}
                        />
                        <div className="h-1 bg-gray-100 rounded" />
                        <div className="h-1 bg-gray-50 rounded" />
                        <div className="h-1 bg-gray-100 rounded" />
                    </div>

                    {/* Total section */}
                    <div
                        className="h-3 rounded"
                        style={{ backgroundColor: template.colors.primary, opacity: 0.9 }}
                    />

                    {/* Footer */}
                    <div className="flex gap-1">
                        <div
                            className="flex-1 h-2 rounded"
                            style={{ backgroundColor: template.colors.background || '#f8f9fa' }}
                        />
                        <div className="w-6 h-2 border rounded" style={{ borderColor: template.colors.border || '#e5e7eb' }} />
                    </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center cursor-pointer">
                    <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white rounded-full p-1">
                        <Eye className="w-3 h-3 text-gray-700" />
                    </div>
                </div>
            </div>
        );
    };

    // Template card component
    const TemplateCard = ({ template }) => {
        const isSelected = selectedTemplate === template.id;
        const colorScheme = template.colors;

        return (
            <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
                    }`}
                onClick={() => handleTemplateChange(template.id)}
            >
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            {template.isDefault && (
                                <Badge variant="secondary" className="text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    Default
                                </Badge>
                            )}
                            {isSelected && (
                                <Badge variant="default" className="text-xs">
                                    <Check className="w-3 h-3 mr-1" />
                                    Selected
                                </Badge>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePreview(template.id);
                            }}
                            className="relative group"
                            title="Full Screen Preview"
                        >
                            <Eye className="w-4 h-4" />
                            <span className="ml-1 text-xs hidden group-hover:inline">Full</span>
                        </Button>
                    </div>
                    <CardDescription className="text-sm">
                        {template.description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Color scheme preview */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-500">Colors:</span>
                        <div className="flex gap-1">
                            <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: colorScheme.primary }}
                                title="Primary"
                            />
                            <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: colorScheme.secondary }}
                                title="Secondary"
                            />
                            <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: colorScheme.accent }}
                                title="Accent"
                            />
                        </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 mb-4">
                        <span className="text-xs font-medium text-gray-600">Features:</span>
                        <div className="flex flex-wrap gap-1">
                            {template.features.slice(0, 3).map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                    {feature}
                                </Badge>
                            ))}
                            {template.features.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{template.features.length - 3} more
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Mini Preview */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">Preview:</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-6 px-2 hover:bg-blue-50"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePreview(template.id);
                                }}
                            >
                                <Maximize2 className="w-3 h-3 mr-1" />
                                Expand
                            </Button>
                        </div>
                        <div
                            className="cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePreview(template.id);
                            }}
                        >
                            <MiniTemplatePreview template={template} />
                        </div>
                    </div>

                    {/* Category and tags */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{template.category}</span>
                        <span>v{template.version}</span>
                    </div>
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Invoice Template Settings</CardTitle>
                    <CardDescription>Loading template configuration...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center p-8">
                        <Loader />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                {/* Performance Monitor - DISABLED - It was causing the infinite loop! */}
                {false && (
                    <ReactPerformanceMonitor componentName="InvoiceTemplateSettings" />
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Invoice Template Settings</h1>
                        <p className="text-gray-600 mt-1">Customize your invoice templates and preferences</p>
                    </div>
                    <div className="flex items-center gap-3">

                        <Button variant="outline" onClick={() => onClose && onClose()}>
                            Close
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="templates" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="templates" className="flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            Templates
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Settings
                        </TabsTrigger>
                        <TabsTrigger value="preferences" className="flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Preferences
                        </TabsTrigger>
                    </TabsList>

                    {/* Templates Tab */}
                    <TabsContent value="templates" className="space-y-6">
                        {/* Search and Filter */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="w-5 h-5" />
                                    Choose Template
                                </CardTitle>
                                <CardDescription>
                                    Select from our collection of professionally designed invoice templates
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Search templates..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="max-w-sm"
                                        />
                                    </div>
                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(TEMPLATE_CATEGORIES).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Templates Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredTemplates.map((template) => (
                                        <TemplateCard key={template.id} template={template} />
                                    ))}
                                </div>

                                {filteredTemplates.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No templates found matching your criteria.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                                <span>Loading template settings...</span>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Page Settings */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Monitor className="w-5 h-5" />
                                            Page Settings
                                        </CardTitle>
                                        <CardDescription>
                                            Configure page layout and format options
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="pageSize">Page Size</Label>
                                                <Select
                                                    value={templateSettings.pageSize}
                                                    onValueChange={(value) => handleSettingUpdate('pageSize', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {pageSizeOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="orientation">Orientation</Label>
                                                <Select
                                                    value={templateSettings.orientation}
                                                    onValueChange={(value) => handleSettingUpdate('orientation', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {orientationOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="fontSize">Font Size</Label>
                                                <Select
                                                    value={templateSettings.fontSize}
                                                    onValueChange={(value) => handleSettingUpdate('fontSize', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {fontSizeOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="margins">Margins</Label>
                                                <Select
                                                    value={templateSettings.margins}
                                                    onValueChange={(value) => handleSettingUpdate('margins', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {marginOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Theme Settings */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Palette className="w-5 h-5" />
                                            Theme Settings
                                        </CardTitle>
                                        <CardDescription>
                                            Customize colors and appearance
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="colorScheme">Color Scheme</Label>
                                            <Select
                                                value={templateSettings.colorScheme}
                                                onValueChange={(value) => handleSettingUpdate('colorScheme', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {colorSchemeOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Current template preview */}
                                        {selectedTemplate && (
                                            <div className="p-4 border rounded-lg bg-gray-50">
                                                <p className="text-sm font-medium mb-2">Current Template:</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex gap-1">
                                                        {TemplateFactory.getTemplateColors(selectedTemplate) &&
                                                            Object.values(TemplateFactory.getTemplateColors(selectedTemplate)).map((color, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                                                    style={{ backgroundColor: color }}
                                                                />
                                                            ))}
                                                    </div>
                                                    <span className="text-sm font-medium">
                                                        {TemplateFactory.getTemplate(selectedTemplate)?.name}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </TabsContent>

                    {/* Preferences Tab */}
                    <TabsContent value="preferences" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="w-5 h-5" />
                                    User Preferences
                                </CardTitle>
                                <CardDescription>
                                    Configure your workflow and behavior preferences
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Preview Settings */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium flex items-center gap-2">
                                            <Eye className="w-4 h-4" />
                                            Preview Settings
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="showPreview">Show Preview Before Download</Label>
                                                <p className="text-xs text-gray-500">Display PDF preview before downloading</p>
                                            </div>
                                            <Switch
                                                id="showPreview"
                                                checked={templateSettings.showPreviewBeforeDownload}
                                                onCheckedChange={(checked) =>
                                                    handleSettingUpdate('showPreviewBeforeDownload', checked)
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Auto-save Settings */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium flex items-center gap-2">
                                            <Settings className="w-4 h-4" />
                                            Auto-save Settings
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="autoSave">Auto-save Template Choice</Label>
                                                <p className="text-xs text-gray-500">Automatically save template selection</p>
                                            </div>
                                            <Switch
                                                id="autoSave"
                                                checked={templateSettings.autoGeneratePDF}
                                                onCheckedChange={(checked) =>
                                                    handleSettingUpdate('autoGeneratePDF', checked)
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="rememberTemplate">Remember Last Used Template</Label>
                                                <p className="text-xs text-gray-500">Use the last selected template by default</p>
                                            </div>
                                            <Switch
                                                id="rememberTemplate"
                                                checked={templateSettings.rememberLastUsedTemplate || true}
                                                onCheckedChange={(checked) =>
                                                    handleSettingUpdate('rememberLastUsedTemplate', checked)
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Advanced Settings */}
                                <div className="pt-4 border-t">
                                    <h3 className="font-medium mb-4 flex items-center gap-2">
                                        <Zap className="w-4 h-4" />
                                        Advanced Settings
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="recommendations">Enable Template Recommendations</Label>
                                            <p className="text-xs text-gray-500">Show template suggestions based on usage</p>
                                        </div>
                                        <Switch
                                            id="recommendations"
                                            checked={templateSettings.enableTemplateRecommendations || true}
                                            onCheckedChange={(checked) =>
                                                handleSettingUpdate('enableTemplateRecommendations', checked)
                                            }
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Button variant="outline" onClick={handleExport}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Settings
                                </Button>
                                <div>
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleImport}
                                        style={{ display: 'none' }}
                                        id="import-config"
                                    />
                                    <Button variant="outline" onClick={() => document.getElementById('import-config').click()}>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Import Settings
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline">
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Reset to Defaults
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Reset Settings</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will reset all template settings to their default values.
                                                This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleReset}>
                                                Reset Settings
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    {saving && (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    )}
                                    {!saving && (
                                        <>
                                            <Check className="w-4 h-4 text-green-500" />
                                            Auto-saved
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Full Preview Modal */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0">
                    <DialogHeader className="p-6 pb-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="flex items-center gap-2">
                                    <Eye className="w-5 h-5" />
                                    Template Preview
                                </DialogTitle>
                                <DialogDescription>
                                    {previewTemplate && TemplateFactory.getTemplate(previewTemplate)?.name} - Full Preview
                                </DialogDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* View Mode Selector */}
                                <Select value={previewMode} onValueChange={setPreviewMode}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="desktop">
                                            <div className="flex items-center gap-2">
                                                <Monitor className="w-4 h-4" />
                                                Desktop
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="mobile">
                                            <div className="flex items-center gap-2">
                                                <Smartphone className="w-4 h-4" />
                                                Mobile
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="print">
                                            <div className="flex items-center gap-2">
                                                <Printer className="w-4 h-4" />
                                                Print
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 p-6 pt-4 h-[calc(90vh-180px)] overflow-hidden">
                        <div className="flex justify-center h-full">
                            <div className="bg-gray-50 rounded-lg p-4 w-full h-full overflow-hidden">
                                {previewTemplate && (
                                    <TemplateErrorBoundary>
                                        <TemplatePreview
                                            templateId={previewTemplate}
                                            settings={templateSettings}
                                            mode={previewMode}
                                            previewPageSize={previewPageSize}
                                            previewFontSize={previewFontSize}
                                        />
                                    </TemplateErrorBoundary>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer with preview controls */}
                    <div className="border-t bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Preview Page Size:</span>
                                    <Select
                                        value={previewPageSize}
                                        onValueChange={setPreviewPageSize}
                                    >
                                        <SelectTrigger className="w-24 h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pageSizeOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.value}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Preview Font Size:</span>
                                    <Select
                                        value={previewFontSize}
                                        onValueChange={setPreviewFontSize}
                                    >
                                        <SelectTrigger className="w-24 h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {fontSizeOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.value}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                    {previewMode.charAt(0).toUpperCase() + previewMode.slice(1)} View
                                </Badge>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsPreviewOpen(false)}
                                >
                                    Close Preview
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default InvoiceTemplateSettings; 