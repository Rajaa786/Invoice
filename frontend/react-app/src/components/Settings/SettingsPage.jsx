import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import {
    Settings,
    FileText,
    Palette,
    User,
    Bell,
    Database,
    Download,
    Upload,
    RefreshCw,
    Check,
    AlertCircle,
    Info,
    Building
} from 'lucide-react';
import InvoiceTemplateSettings from './InvoiceTemplateSettings';
import SettingsDebugger from './SettingsDebugger';
import TemplateDebugPanel from './TemplateDebugPanel';
import {
    useTemplateConfiguration,
    useAppConfiguration,
    useInvoiceConfiguration,
    useUIConfiguration,
    useCompanyConfiguration
} from '../../hooks/useConfiguration';

const SettingsPage = () => {
    const [activeSection, setActiveSection] = useState('templates');
    const [isLoading, setIsLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);

    // Use our configuration hooks
    const {
        theme,
        language,
        setTheme,
        setLanguage,
        loading: appLoading
    } = useAppConfiguration();

    const {
        invoiceDefaults,
        updateInvoiceDefaults,
        loading: invoiceLoading
    } = useInvoiceConfiguration();

    const {
        selectedTemplate,
        setSelectedTemplate,
        templateSettings,
        updateTemplateSettings,
        loading: templateLoading
    } = useTemplateConfiguration();

    // UI settings from configuration service
    const {
        uiPreferences,
        setAutoSave,
        setCompactMode,
        setShowPreview,
        setNotifications,
        loading: uiLoading
    } = useUIConfiguration();

    // Company configuration
    const {
        getCompanyInitials,
        setCompanyInitials,
        isInitialized: companyConfigInitialized
    } = useCompanyConfiguration();

    // State for company prefix management
    const [companies, setCompanies] = useState([]);
    const [companyPrefixes, setCompanyPrefixes] = useState({});
    const [editBuffers, setEditBuffers] = useState({}); // local edit state for each company
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
    const [prefixUpdateStatus, setPrefixUpdateStatus] = useState({});

    // Load companies and their prefixes
    useEffect(() => {
        const loadCompaniesAndPrefixes = async () => {
            if (!companyConfigInitialized) return;

            setIsLoadingCompanies(true);
            try {
                // Fetch companies
                if (window.electron && window.electron.getCompany) {
                    const response = await window.electron.getCompany();
                    if (response.success) {
                        const companiesData = response.companies || [];
                        setCompanies(companiesData);

                        // Load prefixes for each company
                        const prefixes = {};
                        const buffers = {};
                        for (const company of companiesData) {
                            try {
                                const prefix = await getCompanyInitials(company.id);
                                prefixes[company.id] = prefix || generateCompanyInitials(company.companyName);
                                buffers[company.id] = prefix || generateCompanyInitials(company.companyName);
                            } catch (error) {
                                console.error(`Error loading prefix for company ${company.id}:`, error);
                                prefixes[company.id] = generateCompanyInitials(company.companyName);
                                buffers[company.id] = generateCompanyInitials(company.companyName);
                            }
                        }
                        setCompanyPrefixes(prefixes);
                        setEditBuffers(buffers);
                    }
                }
            } catch (error) {
                console.error('Error loading companies and prefixes:', error);
            } finally {
                setIsLoadingCompanies(false);
            }
        };

        loadCompaniesAndPrefixes();
    }, [companyConfigInitialized, getCompanyInitials]);

    // Helper function to generate company initials
    const generateCompanyInitials = (companyName) => {
        if (!companyName) return '';
        return companyName
            .split(/\s+/)
            .map(word => word[0]?.toUpperCase() || '')
            .join('')
            .substring(0, 6);
    };

    // Update company prefix
    const updateCompanyPrefix = async (companyId, newPrefix) => {
        if (!newPrefix.trim()) return;
        setPrefixUpdateStatus(prev => ({ ...prev, [companyId]: 'updating' }));
        try {
            const success = await setCompanyInitials(companyId, newPrefix.trim().toUpperCase());
            if (success) {
                setCompanyPrefixes(prev => ({ ...prev, [companyId]: newPrefix.trim().toUpperCase() }));
                setEditBuffers(prev => ({ ...prev, [companyId]: newPrefix.trim().toUpperCase() }));
                setPrefixUpdateStatus(prev => ({ ...prev, [companyId]: 'success' }));
                setTimeout(() => {
                    setPrefixUpdateStatus(prev => ({ ...prev, [companyId]: null }));
                }, 2000);
            } else {
                setPrefixUpdateStatus(prev => ({ ...prev, [companyId]: 'error' }));
                setTimeout(() => {
                    setPrefixUpdateStatus(prev => ({ ...prev, [companyId]: null }));
                }, 3000);
            }
        } catch (error) {
            console.error('Error updating company prefix:', error);
            setPrefixUpdateStatus(prev => ({ ...prev, [companyId]: 'error' }));
            setTimeout(() => {
                setPrefixUpdateStatus(prev => ({ ...prev, [companyId]: null }));
            }, 3000);
        }
    };

    const handleSaveSettings = async (section) => {
        setIsLoading(true);
        setSaveStatus(null);

        try {
            console.log(`Settings for section '${section}' are auto-saved through configuration hooks`);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error('Settings save confirmation error:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    const SettingsHeader = () => (
        <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Application Settings</h1>
                    <p className="text-sm text-gray-600">Customize your invoice application experience</p>
                </div>
            </div>

            {saveStatus && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${saveStatus === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {saveStatus === 'success' ? (
                        <Check className="w-4 h-4" />
                    ) : (
                        <AlertCircle className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                        {saveStatus === 'success'
                            ? 'Settings saved successfully!'
                            : 'Failed to save settings. Please try again.'
                        }
                    </span>
                </div>
            )}
        </div>
    );

    const GeneralSettings = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Palette className="w-5 h-5 text-purple-600" />
                        Appearance & Interface
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="theme">Theme</Label>
                            <Select
                                value={theme || 'light'}
                                onValueChange={(value) => setTheme(value)}
                                disabled={appLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="auto">Auto (System)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="language">Language</Label>
                            <Select
                                value={language || 'en'}
                                onValueChange={(value) => setLanguage(value)}
                                disabled={appLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="hi">Hindi</SelectItem>
                                    <SelectItem value="es">Spanish</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>Auto-save</Label>
                                <p className="text-sm text-gray-500">Automatically save changes as you work</p>
                            </div>
                            <Switch
                                checked={uiPreferences?.autoSave === true}
                                onCheckedChange={(checked) => setAutoSave(checked)}
                                disabled={uiLoading}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>Compact mode</Label>
                                <p className="text-sm text-gray-500">Use a more compact interface layout</p>
                            </div>
                            <Switch
                                checked={uiPreferences?.compactMode === true}
                                onCheckedChange={(checked) => setCompactMode(checked)}
                                disabled={uiLoading}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>Show preview before download</Label>
                                <p className="text-sm text-gray-500">Preview invoices before downloading</p>
                            </div>
                            <Switch
                                checked={uiPreferences?.showPreview === true}
                                onCheckedChange={(checked) => setShowPreview(checked)}
                                disabled={uiLoading}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Bell className="w-5 h-5 text-orange-600" />
                        Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label>Enable notifications</Label>
                            <p className="text-sm text-gray-500">Receive notifications for important events</p>
                        </div>
                        <Switch
                            checked={uiPreferences?.notifications === true}
                            onCheckedChange={(checked) => setNotifications(checked)}
                            disabled={uiLoading}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button
                    onClick={() => handleSaveSettings('general')}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                >
                    {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <Check className="w-4 h-4" />
                    )}
                    Save General Settings
                </Button>
            </div>
        </div>
    );

    const InvoicePreferences = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="w-5 h-5 text-green-600" />
                        Invoice Defaults
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {invoiceLoading ? (
                        <div className="flex items-center gap-2 text-gray-500">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Loading invoice preferences...
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="currency">Default Currency</Label>
                                <Select
                                    value={invoiceDefaults?.currency || 'INR'}
                                    onValueChange={(value) => updateInvoiceDefaults({ currency: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                                        <SelectItem value="EUR">Euro (€)</SelectItem>
                                        <SelectItem value="GBP">British Pound (£)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="paymentTerms">Default Payment Terms</Label>
                                <Select
                                    value={invoiceDefaults?.paymentTerms || '30'}
                                    onValueChange={(value) => updateInvoiceDefaults({ paymentTerms: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Due on Receipt</SelectItem>
                                        <SelectItem value="15">Net 15 Days</SelectItem>
                                        <SelectItem value="30">Net 30 Days</SelectItem>
                                        <SelectItem value="45">Net 45 Days</SelectItem>
                                        <SelectItem value="60">Net 60 Days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                                <Input
                                    type="number"
                                    value={invoiceDefaults?.taxRate || '18'}
                                    onChange={(e) => updateInvoiceDefaults({ taxRate: e.target.value })}
                                    placeholder="18"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lateFee">Late Fee (%)</Label>
                                <Input
                                    type="number"
                                    value={invoiceDefaults?.lateFee || '0'}
                                    onChange={(e) => updateInvoiceDefaults({ lateFee: e.target.value })}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Company Invoice Prefixes */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Building className="w-5 h-5 text-blue-600" />
                        Company Invoice Prefixes
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoadingCompanies ? (
                        <div className="flex items-center gap-2 text-gray-500">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Loading company settings...
                        </div>
                    ) : companies.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                            <Building className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No companies found</p>
                            <p className="text-sm">Add companies to manage their invoice prefixes</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="text-sm text-gray-600 mb-4">
                                Set custom invoice prefixes for each company. This will be used to generate invoice numbers (e.g., ABC0001).
                            </div>
                            {companies.map((company) => (
                                <div key={company.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                    {company.logo && (
                                        <div className="w-8 h-8 rounded border overflow-hidden flex-shrink-0">
                                            <img
                                                src={company.logo}
                                                alt={`${company.companyName} logo`}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">{company.companyName}</div>
                                        <div className="text-xs text-gray-500">{company.city}, {company.state}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={editBuffers[company.id] || ''}
                                            onChange={(e) => {
                                                const value = e.target.value.toUpperCase().slice(0, 6);
                                                setEditBuffers(prev => ({ ...prev, [company.id]: value }));
                                            }}
                                            placeholder="ABC"
                                            className="w-20 text-center text-sm"
                                            maxLength={6}
                                        />
                                        {editBuffers[company.id] !== companyPrefixes[company.id] && !!editBuffers[company.id] && (
                                            <Button
                                                size="sm"
                                                onClick={() => updateCompanyPrefix(company.id, editBuffers[company.id])}
                                                disabled={prefixUpdateStatus[company.id] === 'updating'}
                                                className="px-3 py-1 text-xs"
                                            >
                                                {prefixUpdateStatus[company.id] === 'updating' ? (
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    'Save'
                                                )}
                                            </Button>
                                        )}
                                        <div className="w-8 text-center">
                                            {prefixUpdateStatus[company.id] === 'success' && (
                                                <Check className="w-4 h-4 text-green-500 mx-auto" />
                                            )}
                                            {prefixUpdateStatus[company.id] === 'error' && (
                                                <AlertCircle className="w-4 h-4 text-red-500 mx-auto" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                                <div className="flex items-start gap-2">
                                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-blue-700">
                                        <strong>Invoice Numbering:</strong> Prefixes are used to generate unique invoice numbers.
                                        For example, a prefix "ABC" will create invoice numbers like ABC0001, ABC0002, etc.
                                        Changes are auto-saved when you finish editing.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    const DataManagement = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Database className="w-5 h-5 text-blue-600" />
                        Data Management
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Export Data</h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Download all your invoice data for backup or migration
                            </p>
                            <Button variant="outline" className="w-full" disabled={isLoading}>
                                <Download className="w-4 h-4 mr-2" />
                                Export All Data
                            </Button>
                        </div>

                        <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Import Data</h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Import invoice data from another system or backup
                            </p>
                            <Button variant="outline" className="w-full" disabled={isLoading}>
                                <Upload className="w-4 h-4 mr-2" />
                                Import Data
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-yellow-800">Backup Recommendation</h4>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Regular backups help protect your important invoice data. We recommend
                                    exporting your data weekly.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-6">
            <SettingsHeader />

            <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="templates" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Templates
                    </TabsTrigger>
                    <TabsTrigger value="general" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="invoice" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Invoice Defaults
                    </TabsTrigger>
                    <TabsTrigger value="data" className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Data Management
                    </TabsTrigger>
                    <TabsTrigger value="debug" className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Debug
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="space-y-6 mt-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-2">
                            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-blue-800">Invoice Template Settings</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    Customize your invoice templates and manage template configurations.
                                    All changes are automatically saved.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Include the existing InvoiceTemplateSettings component */}
                    <InvoiceTemplateSettings />
                </TabsContent>

                <TabsContent value="general" className="space-y-6 mt-6">
                    <GeneralSettings />
                </TabsContent>

                <TabsContent value="invoice" className="space-y-6 mt-6">
                    <InvoicePreferences />
                </TabsContent>

                <TabsContent value="data" className="space-y-6 mt-6">
                    <DataManagement />
                </TabsContent>

                <TabsContent value="debug" className="space-y-6 mt-6">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-orange-800">Template System Debug</h4>
                                <p className="text-sm text-orange-700 mt-1">
                                    Monitor template selection and PDF generation processes. Use this panel to troubleshoot template-related issues.
                                </p>
                            </div>
                        </div>
                    </div>

                    <TemplateDebugPanel />
                </TabsContent>

            </Tabs>

            {/* Temporary debugging component - uncomment if needed for debugging */}
            {/* <SettingsDebugger /> */}
        </div>
    );
};

export default SettingsPage; 