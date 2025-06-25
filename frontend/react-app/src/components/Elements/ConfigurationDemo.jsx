import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
    Settings,
    Database,
    FileText,
    Download,
    Upload,
    RotateCcw,
    CheckCircle,
    AlertTriangle,
    Info
} from 'lucide-react';

// Import our new hooks
import {
    useConfiguration,
    useTemplateConfiguration,
    useAppConfiguration,
    useInvoiceConfiguration,
    useCompanyConfiguration,
    useBulkConfiguration
} from '../../hooks/useConfiguration';

/**
 * Configuration Architecture Demo Component
 * Demonstrates the new decoupled configuration system with multiple providers
 */
const ConfigurationDemo = () => {
    const [status, setStatus] = useState('');
    const [error, setError] = useState(null);

    // Individual configuration hooks
    const { configService, isInitialized, error: configError } = useConfiguration();
    const {
        selectedTemplate,
        templateSettings,
        loading: templateLoading,
        setSelectedTemplate,
        updateTemplateSettings
    } = useTemplateConfiguration();

    const {
        theme,
        language,
        loading: appLoading,
        setTheme,
        setLanguage
    } = useAppConfiguration();

    const {
        invoiceDefaults,
        loading: invoiceLoading,
        updateInvoiceDefaults
    } = useInvoiceConfiguration();

    const {
        getCompanyInitials,
        setCompanyInitials,
        getDefaultCompany,
        setDefaultCompany
    } = useCompanyConfiguration();

    const {
        exportConfiguration,
        importConfiguration,
        resetSection
    } = useBulkConfiguration();

    // Demo state
    const [testCompanyId, setTestCompanyId] = useState('company123');
    const [testInitials, setTestInitials] = useState('ABC');
    const [exportedConfig, setExportedConfig] = useState(null);

    useEffect(() => {
        if (configError) {
            setError(configError.message);
        }
    }, [configError]);

    const showStatus = (message, type = 'info') => {
        setStatus(`${type.toUpperCase()}: ${message}`);
        setTimeout(() => setStatus(''), 3000);
    };

    const handleTemplateChange = async () => {
        const newTemplate = selectedTemplate === 'classic_blue' ? 'modern_green' : 'classic_blue';
        const success = await setSelectedTemplate(newTemplate);
        showStatus(success ? `Template changed to ${newTemplate}` : 'Failed to change template', success ? 'success' : 'error');
    };

    const handleThemeChange = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        const success = await setTheme(newTheme);
        showStatus(success ? `Theme changed to ${newTheme}` : 'Failed to change theme', success ? 'success' : 'error');
    };

    const handleTemplateSettingsUpdate = async () => {
        const newSettings = {
            pageSize: templateSettings.pageSize === 'A4' ? 'Letter' : 'A4',
            fontSize: templateSettings.fontSize === 'normal' ? 'large' : 'normal'
        };
        const success = await updateTemplateSettings(newSettings);
        showStatus(success ? 'Template settings updated' : 'Failed to update settings', success ? 'success' : 'error');
    };

    const handleInvoiceDefaultsUpdate = async () => {
        const newDefaults = {
            currency: invoiceDefaults.currency === 'INR' ? 'USD' : 'INR',
            paymentTerms: invoiceDefaults.paymentTerms === '30' ? '45' : '30'
        };
        const success = await updateInvoiceDefaults(newDefaults);
        showStatus(success ? 'Invoice defaults updated' : 'Failed to update defaults', success ? 'success' : 'error');
    };

    const handleCompanyInitialsTest = async () => {
        const success = await setCompanyInitials(testCompanyId, testInitials);
        if (success) {
            const saved = await getCompanyInitials(testCompanyId);
            showStatus(`Company initials saved: ${saved}`, 'success');
        } else {
            showStatus('Failed to save company initials', 'error');
        }
    };

    const handleExportConfig = async () => {
        const config = await exportConfiguration();
        if (config) {
            setExportedConfig(JSON.stringify(config, null, 2));
            showStatus('Configuration exported successfully', 'success');
        } else {
            showStatus('Failed to export configuration', 'error');
        }
    };

    const handleImportConfig = async () => {
        if (!exportedConfig) {
            showStatus('No configuration to import', 'warning');
            return;
        }

        try {
            const config = JSON.parse(exportedConfig);
            const success = await importConfiguration(config);
            showStatus(success ? 'Configuration imported successfully' : 'Failed to import configuration', success ? 'success' : 'error');
        } catch (err) {
            showStatus('Invalid JSON format', 'error');
        }
    };

    const handleResetSection = async (section) => {
        const success = await resetSection(section);
        showStatus(success ? `${section} section reset` : `Failed to reset ${section}`, success ? 'success' : 'error');
    };

    if (!isInitialized) {
        return (
            <Card className="w-full max-w-4xl mx-auto">
                <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span>Initializing configuration system...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 p-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Configuration Architecture Demo
                    </CardTitle>
                    <div className="flex items-center gap-4">
                        <Badge variant={isInitialized ? "success" : "destructive"}>
                            {isInitialized ? "Initialized" : "Not Ready"}
                        </Badge>
                        <Badge variant="outline">
                            Service: {configService?.getServiceInfo?.()?.type || 'Unknown'}
                        </Badge>
                    </div>
                </CardHeader>

                {error && (
                    <CardContent>
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </CardContent>
                )}

                {status && (
                    <CardContent className="pt-0">
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>{status}</AlertDescription>
                        </Alert>
                    </CardContent>
                )}
            </Card>

            <Tabs defaultValue="templates" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="app">Application</TabsTrigger>
                    <TabsTrigger value="invoice">Invoice</TabsTrigger>
                    <TabsTrigger value="company">Company</TabsTrigger>
                    <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Template Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {templateLoading ? (
                                <div>Loading template configuration...</div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Selected Template</Label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline">{selectedTemplate}</Badge>
                                                <Button size="sm" onClick={handleTemplateChange}>
                                                    Switch Template
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Template Settings</Label>
                                            <div className="mt-1 space-y-1">
                                                <div className="text-sm">Page Size: {templateSettings.pageSize}</div>
                                                <div className="text-sm">Font Size: {templateSettings.fontSize}</div>
                                                <Button size="sm" onClick={handleTemplateSettingsUpdate}>
                                                    Update Settings
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="app" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Application Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {appLoading ? (
                                <div>Loading application configuration...</div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Theme</Label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline">{theme}</Badge>
                                                <Button size="sm" onClick={handleThemeChange}>
                                                    Toggle Theme
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Language</Label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline">{language}</Badge>
                                                <Button size="sm" onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}>
                                                    Switch Language
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="invoice" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {invoiceLoading ? (
                                <div>Loading invoice configuration...</div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Currency</Label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline">{invoiceDefaults.currency}</Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Payment Terms</Label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline">{invoiceDefaults.paymentTerms} days</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <Button onClick={handleInvoiceDefaultsUpdate}>
                                        Update Invoice Defaults
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="company" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Test Company ID</Label>
                                    <Input
                                        value={testCompanyId}
                                        onChange={(e) => setTestCompanyId(e.target.value)}
                                        placeholder="Enter company ID"
                                    />
                                </div>
                                <div>
                                    <Label>Company Initials</Label>
                                    <Input
                                        value={testInitials}
                                        onChange={(e) => setTestInitials(e.target.value)}
                                        placeholder="Enter initials"
                                    />
                                </div>
                            </div>
                            <Button onClick={handleCompanyInitialsTest}>
                                Save Company Initials
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bulk" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bulk Operations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <Button onClick={handleExportConfig} className="flex items-center gap-2">
                                    <Download className="w-4 h-4" />
                                    Export Config
                                </Button>
                                <Button onClick={handleImportConfig} disabled={!exportedConfig} className="flex items-center gap-2">
                                    <Upload className="w-4 h-4" />
                                    Import Config
                                </Button>
                                <Button onClick={() => handleResetSection('templates')} variant="destructive" className="flex items-center gap-2">
                                    <RotateCcw className="w-4 h-4" />
                                    Reset Templates
                                </Button>
                            </div>

                            {exportedConfig && (
                                <div>
                                    <Label>Exported Configuration</Label>
                                    <textarea
                                        value={exportedConfig}
                                        onChange={(e) => setExportedConfig(e.target.value)}
                                        className="w-full h-32 mt-1 p-2 border rounded"
                                        placeholder="Configuration JSON..."
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Architecture Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <strong>Service Type:</strong> {configService?.getServiceInfo?.()?.type || 'Unknown'}
                        </div>
                        <div>
                            <strong>Initialized:</strong> {isInitialized ? 'Yes' : 'No'}
                        </div>
                        <div>
                            <strong>Environment:</strong> {typeof window !== 'undefined' && window.electronSettings ? 'Electron' : 'Browser'}
                        </div>
                        <div>
                            <strong>Storage:</strong> {typeof window !== 'undefined' && window.electronSettings ? 'electron-settings' : 'localStorage'}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ConfigurationDemo; 