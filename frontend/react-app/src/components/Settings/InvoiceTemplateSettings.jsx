import React, { useState, useEffect } from 'react';
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
    Printer
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

// Import our template system
import { TemplateFactory, TEMPLATE_CATEGORIES } from '../Elements/InvoiceTemplates/TemplateRegistry';
import { ConfigurationManager, InvoiceConfigHelpers } from '../Elements/InvoiceTemplates/ConfigurationManager';

const InvoiceTemplateSettings = ({ onClose }) => {
    const { toast } = useToast();

    // State management
    const [selectedTemplate, setSelectedTemplate] = useState(ConfigurationManager.getSelectedTemplate());
    const [templateSettings, setTemplateSettings] = useState(ConfigurationManager.getTemplateSettings());
    const [userPreferences, setUserPreferences] = useState(ConfigurationManager.getUserPreferences());
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [previewTemplate, setPreviewTemplate] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Template data
    const [templates] = useState(TemplateFactory.getAllTemplates());
    const [filteredTemplates, setFilteredTemplates] = useState(templates);

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
    const handleTemplateSelect = (templateId) => {
        setSelectedTemplate(templateId);
        setHasUnsavedChanges(true);
    };

    // Handle settings change
    const handleSettingsChange = (key, value) => {
        setTemplateSettings(prev => ({ ...prev, [key]: value }));
        setHasUnsavedChanges(true);
    };

    // Handle preferences change
    const handlePreferencesChange = (key, value) => {
        setUserPreferences(prev => ({ ...prev, [key]: value }));
        setHasUnsavedChanges(true);
    };

    // Save settings
    const handleSave = () => {
        try {
            ConfigurationManager.setSelectedTemplate(selectedTemplate);
            ConfigurationManager.setTemplateSettings(templateSettings);
            ConfigurationManager.setUserPreferences(userPreferences);

            setHasUnsavedChanges(false);
            toast({
                title: "Settings Saved",
                description: "Your template settings have been saved successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save settings. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Reset to defaults
    const handleReset = () => {
        ConfigurationManager.resetConfiguration();
        setSelectedTemplate(ConfigurationManager.getSelectedTemplate());
        setTemplateSettings(ConfigurationManager.getTemplateSettings());
        setUserPreferences(ConfigurationManager.getUserPreferences());
        setHasUnsavedChanges(false);

        toast({
            title: "Settings Reset",
            description: "All settings have been reset to defaults.",
        });
    };

    // Export configuration
    const handleExport = () => {
        try {
            const config = ConfigurationManager.exportConfiguration();
            const blob = new Blob([config], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'invoice-template-settings.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast({
                title: "Settings Exported",
                description: "Configuration exported successfully.",
            });
        } catch (error) {
            toast({
                title: "Export Failed",
                description: "Failed to export settings.",
                variant: "destructive",
            });
        }
    };

    // Import configuration
    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const success = ConfigurationManager.importConfiguration(e.target.result);
                if (success) {
                    setSelectedTemplate(ConfigurationManager.getSelectedTemplate());
                    setTemplateSettings(ConfigurationManager.getTemplateSettings());
                    setUserPreferences(ConfigurationManager.getUserPreferences());
                    setHasUnsavedChanges(false);

                    toast({
                        title: "Settings Imported",
                        description: "Configuration imported successfully.",
                    });
                } else {
                    throw new Error('Invalid configuration file');
                }
            } catch (error) {
                toast({
                    title: "Import Failed",
                    description: "Failed to import settings. Please check the file format.",
                    variant: "destructive",
                });
            }
        };
        reader.readAsText(file);
    };

    // Preview template
    const handlePreview = (templateId) => {
        setPreviewTemplate(templateId);
        setIsPreviewOpen(true);
    };

    // Template card component
    const TemplateCard = ({ template }) => {
        const isSelected = selectedTemplate === template.id;
        const colorScheme = template.colors;

        return (
            <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
                    }`}
                onClick={() => handleTemplateSelect(template.id)}
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
                        >
                            <Eye className="w-4 h-4" />
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
                    <div className="space-y-2">
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

                    {/* Category and tags */}
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>{template.category}</span>
                        <span>v{template.version}</span>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Invoice Template Settings</h1>
                    <p className="text-gray-600 mt-1">Customize your invoice templates and preferences</p>
                </div>
                <div className="flex items-center gap-3">
                    {hasUnsavedChanges && (
                        <Badge variant="destructive" className="text-xs">
                            Unsaved Changes
                        </Badge>
                    )}
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                            onValueChange={(value) => handleSettingsChange('pageSize', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A4">A4</SelectItem>
                                                <SelectItem value="Letter">Letter</SelectItem>
                                                <SelectItem value="Legal">Legal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="orientation">Orientation</Label>
                                        <Select
                                            value={templateSettings.orientation}
                                            onValueChange={(value) => handleSettingsChange('orientation', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="portrait">Portrait</SelectItem>
                                                <SelectItem value="landscape">Landscape</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="fontSize">Font Size</Label>
                                        <Select
                                            value={templateSettings.fontSize}
                                            onValueChange={(value) => handleSettingsChange('fontSize', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="small">Small</SelectItem>
                                                <SelectItem value="normal">Normal</SelectItem>
                                                <SelectItem value="large">Large</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="margins">Margins</Label>
                                        <Select
                                            value={templateSettings.margins}
                                            onValueChange={(value) => handleSettingsChange('margins', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="narrow">Narrow</SelectItem>
                                                <SelectItem value="normal">Normal</SelectItem>
                                                <SelectItem value="wide">Wide</SelectItem>
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
                                        onValueChange={(value) => handleSettingsChange('colorScheme', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">Default</SelectItem>
                                            <SelectItem value="high-contrast">High Contrast</SelectItem>
                                            <SelectItem value="monochrome">Monochrome</SelectItem>
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
                                            checked={userPreferences.showPreviewBeforeDownload}
                                            onCheckedChange={(checked) =>
                                                handlePreferencesChange('showPreviewBeforeDownload', checked)
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
                                            checked={userPreferences.autoSaveTemplateChoice}
                                            onCheckedChange={(checked) =>
                                                handlePreferencesChange('autoSaveTemplateChoice', checked)
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
                                            checked={userPreferences.rememberLastUsedTemplate}
                                            onCheckedChange={(checked) =>
                                                handlePreferencesChange('rememberLastUsedTemplate', checked)
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
                                        checked={userPreferences.enableTemplateRecommendations}
                                        onCheckedChange={(checked) =>
                                            handlePreferencesChange('enableTemplateRecommendations', checked)
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
                            <Button onClick={handleSave}>
                                <Check className="w-4 h-4 mr-2" />
                                Save Settings
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default InvoiceTemplateSettings; 