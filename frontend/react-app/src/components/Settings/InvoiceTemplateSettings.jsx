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
    ZoomIn,
    ZoomOut,
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

// Import our template system
import { TemplateFactory, TEMPLATE_CATEGORIES } from '../Elements/InvoiceTemplates/TemplateRegistry';
import { ConfigurationManager, InvoiceConfigHelpers } from '../Elements/InvoiceTemplates/ConfigurationManager';
import Loader from '../Elements/Loader';
import ReactPerformanceMonitor from './ReactPerformanceMonitor';

// Sample invoice data for preview - matching actual template data structure
const SAMPLE_INVOICE_DATA = {
    invoiceNumber: 'INV-2024-001',
    date: new Date().toLocaleDateString('en-GB'),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),

    // Company info - matches template expectations
    company: {
        companyName: 'Your Company Name',  // Changed from 'name' to 'companyName'
        addressLine1: '123 Business Street',  // Changed from 'address' to 'addressLine1'
        city: 'Business City',
        state: 'BC',
        zip: '12345',
        phone: '+1 (555) 123-4567',
        email: 'hello@yourcompany.com',
        website: 'www.yourcompany.com',
        gstin: 'GST123456789012345'  // Added GSTIN for India compliance
    },

    // Customer info - matches template expectations
    customer: {
        customerName: 'Customer Company Ltd.',  // Changed from 'name' to 'customerName'
        contactPerson: 'John Smith',
        addressLine1: '456 Client Avenue',  // Changed from 'address' to 'addressLine1'
        city: 'Client City',
        state: 'CC',
        zip: '67890',
        phone: '+1 (555) 987-6543',
        email: 'john@customer.com'
    },

    // Items - matching invoice template structure
    items: [
        {
            id: 1,
            description: 'Professional Consulting Services',
            hsnSac: '998314',  // Added HSN/SAC code
            quantity: 2,
            rate: 2000.00,
            amount: 4000.00
        },
        {
            id: 2,
            description: 'Software Development Services',
            hsnSac: '998313',
            quantity: 1,
            rate: 1500.00,
            amount: 1500.00
        }
    ],

    // Tax calculations - matching Indian invoice structure
    subtotal: 5500.00,
    cgstRate: 9,
    sgstRate: 9,
    cgstAmount: 495.00,
    sgstAmount: 495.00,
    grandTotal: 6490.00,

    notes: 'Thank you for your business! Payment is due within 30 days.',
    paymentTerms: 'Net 30',

    currency: 'INR'  // Changed to Indian Rupees
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
    const [previewMode, setPreviewMode] = useState('desktop'); // desktop, mobile, print
    const [previewZoom, setPreviewZoom] = useState(100);
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
        try {
            setSaving(true);
            console.log('[InvoiceTemplateSettings] Changing template to:', templateId);

            // Optimistic update
            setSelectedTemplate(templateId);

            const success = await ConfigurationManager.setSelectedTemplate(templateId);

            if (success) {
                toastRef.current({
                    title: "Success",
                    description: `Template changed to ${templateId}`
                });
            } else {
                // Revert on failure
                const currentTemplate = await ConfigurationManager.getSelectedTemplate();
                setSelectedTemplate(currentTemplate);
                throw new Error('Failed to change template');
            }
        } catch (error) {
            console.error('[InvoiceTemplateSettings] Error changing template:', error);
            toastRef.current({
                title: "Error",
                description: "Failed to change template",
                variant: "destructive"
            });
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
        setIsPreviewOpen(true);
    };

    // Preview control handlers
    const handleZoomIn = () => setPreviewZoom(prev => Math.min(prev + 25, 200));
    const handleZoomOut = () => setPreviewZoom(prev => Math.max(prev - 25, 50));
    const handleZoomReset = () => setPreviewZoom(100);
    const handleFullscreen = () => {
        // Implementation for fullscreen preview
        console.log('Fullscreen preview');
    };

    // Simple error boundary component
    const TemplateErrorBoundary = ({ children }) => {
        const [hasError, setHasError] = useState(false);

        useEffect(() => {
            setHasError(false);
        }, [selectedTemplate, templateSettings]);

        const handleError = () => {
            setHasError(true);
        };

        if (hasError) {
            return (
                <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg border-2 border-red-200">
                    <div className="text-center p-6">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                        <p className="text-red-700 font-medium mb-2">Template Rendering Error</p>
                        <p className="text-red-600 text-sm">There was an issue rendering this template with the current settings.</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => setHasError(false)}
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
            console.error('Template rendering error:', error);
            handleError();
            return null;
        }
    };

    // Template preview component - DOM-compatible version for preview
    const TemplatePreview = ({ templateId, settings, mode, zoom }) => {
        const template = TemplateFactory.getTemplate(templateId);

        if (!template) {
            return (
                <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
                    <div className="text-center">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-gray-500">Template not found</p>
                        <p className="text-xs text-gray-400 mt-2">Template ID: {templateId}</p>
                    </div>
                </div>
            );
        }

        // Apply template settings to sample data
        const previewData = {
            ...SAMPLE_INVOICE_DATA,
            templateSettings: settings,
            pageSize: settings.pageSize,
            orientation: settings.orientation
        };

        const getPreviewStyles = () => {
            const baseStyles = {
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left',
                transition: 'transform 0.3s ease'
            };

            switch (mode) {
                case 'mobile':
                    return {
                        ...baseStyles,
                        width: '375px',
                        minHeight: '667px'
                    };
                case 'print':
                    // Convert mm/inches to pixels for React compatibility
                    const printWidth = settings.pageSize === 'A4' ? '794px' : '816px'; // A4: 210mm ≈ 794px, Letter: 8.5in ≈ 816px
                    const printHeight = settings.pageSize === 'A4' ? '1123px' : '1056px'; // A4: 297mm ≈ 1123px, Letter: 11in ≈ 1056px
                    return {
                        ...baseStyles,
                        width: printWidth,
                        minHeight: printHeight,
                        backgroundColor: 'white',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e5e7eb'
                    };
                default: // desktop
                    return {
                        ...baseStyles,
                        width: '100%',
                        minHeight: '600px'
                    };
            }
        };

        // Create DOM-compatible template preview
        const DOMTemplatePreview = () => {
            return (
                <div
                    className="template-preview bg-white p-6 font-sans text-sm"
                    style={{
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        color: template.colors.text || '#000'
                    }}
                >
                    {/* Header Section */}
                    <div
                        className="header mb-6 p-6 rounded-lg text-white"
                        style={{ backgroundColor: template.colors.primary }}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold tracking-wider">INVOICE</h1>
                                <p className="text-lg opacity-90">#{previewData.invoiceNumber}</p>
                            </div>
                            <div className="text-right">
                                <div
                                    className="inline-block px-4 py-2 rounded"
                                    style={{ backgroundColor: template.colors.accent }}
                                >
                                    <span className="font-bold">{previewData.invoiceNumber}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Company and Invoice Info */}
                    <div className="flex gap-6 mb-6">
                        <div className="flex-1">
                            <div
                                className="p-4 rounded-lg border"
                                style={{
                                    backgroundColor: template.colors.background || '#f8f9fa',
                                    borderColor: template.colors.border || '#e5e7eb'
                                }}
                            >
                                <h3
                                    className="font-bold text-sm mb-3"
                                    style={{ color: template.colors.primary }}
                                >
                                    FROM
                                </h3>
                                <div className="space-y-1">
                                    <p className="font-bold text-lg">{previewData.company.companyName}</p>
                                    <p className="text-gray-600">{previewData.company.addressLine1}</p>
                                    <p className="text-gray-600">{previewData.company.city}</p>
                                    <p
                                        className="font-semibold text-sm mt-2"
                                        style={{ color: template.colors.primary }}
                                    >
                                        GSTIN: {previewData.company.gstin}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="p-4 rounded-lg border border-gray-200">
                                <h3
                                    className="font-bold text-sm mb-3"
                                    style={{ color: template.colors.primary }}
                                >
                                    INVOICE DETAILS
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Date:</span>
                                        <span className="font-semibold">{previewData.date}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Due Date:</span>
                                        <span className="font-semibold">{previewData.dueDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Page Size:</span>
                                        <span className="font-semibold">{settings.pageSize}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div
                        className="p-4 rounded-lg border mb-6"
                        style={{
                            backgroundColor: template.colors.background || '#f8f9fa',
                            borderColor: template.colors.border || '#e5e7eb'
                        }}
                    >
                        <h3
                            className="font-bold text-sm mb-3"
                            style={{ color: template.colors.primary }}
                        >
                            BILL TO
                        </h3>
                        <div className="space-y-1">
                            <p className="font-bold text-lg">{previewData.customer.customerName}</p>
                            <p className="text-gray-600">{previewData.customer.addressLine1}</p>
                            <p className="text-gray-600">{previewData.customer.city}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-6 rounded-lg border overflow-hidden" style={{ borderColor: template.colors.border || '#e5e7eb' }}>
                        {/* Table Header */}
                        <div
                            className="p-3 text-white font-bold text-xs uppercase tracking-wide"
                            style={{ backgroundColor: template.colors.primary }}
                        >
                            <div className="flex" style={{ gap: '8px' }}>
                                <div className="text-center" style={{ width: '6%' }}>Sl.</div>
                                <div style={{ width: '36%' }}>Description</div>
                                <div className="text-center" style={{ width: '12%' }}>HSN</div>
                                <div className="text-center" style={{ width: '8%' }}>Qty</div>
                                <div className="text-right" style={{ width: '14%' }}>Rate</div>
                                <div className="text-right" style={{ width: '16%' }}>Amount</div>
                            </div>
                        </div>

                        {/* Table Rows */}
                        {previewData.items.map((item, index) => (
                            <div
                                key={index}
                                className={`p-3 border-b text-sm ${index % 2 === 0 ? '' : 'bg-gray-50'}`}
                                style={{ borderColor: template.colors.border || '#e5e7eb' }}
                            >
                                <div className="flex items-center" style={{ gap: '8px' }}>
                                    <div className="text-center" style={{ width: '6%' }}>{index + 1}</div>
                                    <div style={{ width: '36%' }}>{item.description}</div>
                                    <div className="text-center" style={{ width: '12%' }}>{item.hsnSac}</div>
                                    <div className="text-center" style={{ width: '8%' }}>{item.quantity}</div>
                                    <div className="text-right" style={{ width: '14%' }}>₹{item.rate}</div>
                                    <div className="text-right font-semibold" style={{ width: '16%' }}>₹{(item.quantity * item.rate).toFixed(2)}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tax Summary */}
                    <div className="mb-6">
                        <div
                            className="p-4 rounded-lg border"
                            style={{
                                backgroundColor: template.colors.background || '#f8f9fa',
                                borderColor: template.colors.border || '#e5e7eb'
                            }}
                        >
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span className="font-semibold">₹{previewData.subtotal}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>CGST (9%):</span>
                                    <span className="font-semibold">₹{previewData.cgstAmount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>SGST (9%):</span>
                                    <span className="font-semibold">₹{previewData.sgstAmount}</span>
                                </div>
                                <hr className="my-2" style={{ borderColor: template.colors.border || '#e5e7eb' }} />
                                <div
                                    className="flex justify-between p-3 rounded font-bold text-lg text-white"
                                    style={{ backgroundColor: template.colors.primary }}
                                >
                                    <span>TOTAL:</span>
                                    <span>₹{previewData.grandTotal}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Amount in Words */}
                    <div
                        className="p-4 rounded-lg border mb-6"
                        style={{
                            backgroundColor: template.colors.light || '#f1f5f9',
                            borderColor: template.colors.primary || '#3b82f6'
                        }}
                    >
                        <h4
                            className="font-bold mb-2"
                            style={{ color: template.colors.primary }}
                        >
                            Amount in Words:
                        </h4>
                        <p className="italic font-semibold">Rupees Five Thousand Seven Hundred Eighty only</p>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-6">
                        <div
                            className="flex-1 p-4 rounded-lg border"
                            style={{
                                backgroundColor: template.colors.background || '#f8f9fa',
                                borderColor: template.colors.border || '#e5e7eb'
                            }}
                        >
                            <h4
                                className="font-bold mb-2"
                                style={{ color: template.colors.primary }}
                            >
                                Declaration
                            </h4>
                            <p className="text-sm text-gray-600">
                                We declare that this invoice shows the actual price of the goods described
                                and that all particulars are true and correct.
                            </p>
                        </div>

                        <div
                            className="w-64 p-4 rounded-lg border text-center"
                            style={{ borderColor: template.colors.primary || '#3b82f6' }}
                        >
                            <div
                                className="h-16 mb-3 border-dashed border-2 rounded flex items-center justify-center"
                                style={{ borderColor: template.colors.border || '#e5e7eb' }}
                            >
                                <span className="text-gray-400 text-sm">Signature</span>
                            </div>
                            <p className="text-sm text-gray-600">for {previewData.company.companyName}</p>
                            <p
                                className="font-bold text-sm"
                                style={{ color: template.colors.primary }}
                            >
                                Authorized Signatory
                            </p>
                        </div>
                    </div>

                    {/* Template Info Footer */}
                    <div className="mt-6 pt-4 border-t text-center text-xs text-gray-500">
                        <p>Template: {template.name} | Mode: {mode} | Zoom: {zoom}%</p>
                    </div>
                </div>
            );
        };

        return (
            <div className="preview-container overflow-auto bg-gray-100 rounded-lg" style={{ height: '70vh' }}>
                <div className="p-4 flex justify-center">
                    <div
                        className="preview-content bg-white rounded-lg shadow-sm"
                        style={getPreviewStyles()}
                    >
                        <DOMTemplatePreview />
                    </div>
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
                <DialogContent className="max-w-7xl h-[90vh] p-0">
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

                                {/* Zoom Controls */}
                                <div className="flex items-center gap-1 border rounded-lg p-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleZoomOut}
                                        disabled={previewZoom <= 50}
                                    >
                                        <ZoomOut className="w-4 h-4" />
                                    </Button>
                                    <span className="text-sm px-2 min-w-[60px] text-center">{previewZoom}%</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleZoomIn}
                                        disabled={previewZoom >= 200}
                                    >
                                        <ZoomIn className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleZoomReset}
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Action Buttons */}
                                <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export PDF
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 p-6 pt-4 overflow-auto">
                        <div className="flex justify-center">
                            <div className="bg-gray-50 rounded-lg p-4 w-full">
                                {previewTemplate && (
                                    <TemplateErrorBoundary>
                                        <TemplatePreview
                                            templateId={previewTemplate}
                                            settings={templateSettings}
                                            mode={previewMode}
                                            zoom={previewZoom}
                                        />
                                    </TemplateErrorBoundary>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Settings Footer */}
                    <div className="border-t bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Page Size:</span>
                                    <Select
                                        value={templateSettings.pageSize}
                                        onValueChange={(value) => handleSettingUpdate('pageSize', value)}
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
                                    <span className="text-sm font-medium">Font Size:</span>
                                    <Select
                                        value={templateSettings.fontSize}
                                        onValueChange={(value) => handleSettingUpdate('fontSize', value)}
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