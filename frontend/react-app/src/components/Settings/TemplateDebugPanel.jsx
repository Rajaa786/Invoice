import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import {
    Download,
    Trash2,
    RefreshCw,
    Bug,
    Info,
    AlertTriangle,
    CheckCircle,
    Clock,
    Filter,
    FileText,
    HardDrive
} from 'lucide-react';
import { templateLogger } from '../../utils/templateLogger';
import { ConfigurationManager } from '../Elements/InvoiceTemplates/ConfigurationManager';
import { TemplateFactory } from '../Elements/InvoiceTemplates/TemplateRegistry';

const TemplateDebugPanel = () => {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [selectedComponent, setSelectedComponent] = useState('all');
    const [currentTemplate, setCurrentTemplate] = useState(null);
    const [systemInfo, setSystemInfo] = useState({});
    const [electronLogInfo, setElectronLogInfo] = useState({ available: false });
    const [electronLogs, setElectronLogs] = useState({ main: '', template: '' });

    useEffect(() => {
        loadLogs();
        loadSystemInfo();
        loadElectronLogInfo();
    }, []);

    useEffect(() => {
        filterLogs();
    }, [logs, selectedLevel, selectedComponent]);

    const loadLogs = () => {
        const allLogs = templateLogger.getLogs();
        setLogs(allLogs);
    };

    const loadSystemInfo = async () => {
        try {
            const template = await ConfigurationManager.getSelectedTemplate();
            const templates = TemplateFactory.getAllTemplates();
            setCurrentTemplate(template);
            setSystemInfo({
                currentTemplate: template,
                availableTemplates: templates.length,
                templateNames: templates.map(t => t.name),
                sessionId: templateLogger.sessionId,
                isElectron: templateLogger.isElectron
            });
        } catch (error) {
            console.error('Failed to load system info:', error);
        }
    };

    const loadElectronLogInfo = async () => {
        try {
            const logInfo = await templateLogger.getElectronLogInfo();
            setElectronLogInfo(logInfo);
        } catch (error) {
            console.error('Failed to load electron log info:', error);
        }
    };

    const loadElectronLogs = async () => {
        if (!electronLogInfo.available) return;

        try {
            const mainLog = await window.electronLog.readLogFile('main');
            const templateLog = await window.electronLog.readLogFile('template');
            setElectronLogs({ main: mainLog, template: templateLog });
        } catch (error) {
            console.error('Failed to load electron logs:', error);
        }
    };

    const filterLogs = () => {
        let filtered = logs;

        if (selectedLevel !== 'all') {
            filtered = filtered.filter(log => log.level === selectedLevel);
        }

        if (selectedComponent !== 'all') {
            filtered = filtered.filter(log => log.component === selectedComponent);
        }

        setFilteredLogs(filtered);
    };

    const handleExportLogs = () => {
        templateLogger.exportLogs();
    };

    const handleExportElectronLogs = async () => {
        await templateLogger.exportElectronLogs();
    };

    const handleClearLogs = () => {
        templateLogger.clearLogs();
        loadLogs();
    };

    const handleRefreshLogs = () => {
        loadLogs();
        loadSystemInfo();
        loadElectronLogInfo();
    };

    const generateSummaryReport = () => {
        return templateLogger.generateSummaryReport();
    };

    const getLogIcon = (level) => {
        const iconMap = {
            debug: <Bug className="w-4 h-4" />,
            info: <Info className="w-4 h-4" />,
            warn: <AlertTriangle className="w-4 h-4" />,
            error: <AlertTriangle className="w-4 h-4" />,
            success: <CheckCircle className="w-4 h-4" />
        };
        return iconMap[level] || <Info className="w-4 h-4" />;
    };

    const getLogBadgeVariant = (level) => {
        const variantMap = {
            debug: 'secondary',
            info: 'default',
            warn: 'outline',
            error: 'destructive',
            success: 'default'
        };
        return variantMap[level] || 'default';
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    const getUniqueComponents = () => {
        const components = [...new Set(logs.map(log => log.component))];
        return components.sort();
    };

    const LogEntry = ({ log }) => (
        <div className="border-b border-gray-100 p-3 hover:bg-gray-50">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                    {getLogIcon(log.level)}
                    <Badge variant={getLogBadgeVariant(log.level)}>
                        {log.level.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{log.component}</Badge>
                    <span className="text-sm text-gray-500">
                        {formatTimestamp(log.timestamp)}
                    </span>
                </div>
            </div>
            <div className="mt-2">
                <p className="text-sm font-medium">{log.action}</p>
                {Object.keys(log.data).length > 0 && (
                    <details className="mt-1">
                        <summary className="text-xs text-gray-500 cursor-pointer">
                            View data
                        </summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(log.data, null, 2)}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Bug className="w-5 h-5" />
                        <span>Template System Debug Panel</span>
                        {systemInfo.isElectron && (
                            <Badge variant="outline" className="ml-2">
                                <HardDrive className="w-3 h-3 mr-1" />
                                Electron Logging
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="logs" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="logs">Console Logs</TabsTrigger>
                            <TabsTrigger value="electron">Electron Logs</TabsTrigger>
                            <TabsTrigger value="system">System Info</TabsTrigger>
                            <TabsTrigger value="tools">Debug Tools</TabsTrigger>
                        </TabsList>

                        <TabsContent value="logs" className="space-y-4">
                            {/* Log Controls */}
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center space-x-2">
                                    <Filter className="w-4 h-4" />
                                    <select
                                        value={selectedLevel}
                                        onChange={(e) => setSelectedLevel(e.target.value)}
                                        className="border rounded px-2 py-1 text-sm"
                                    >
                                        <option value="all">All Levels</option>
                                        <option value="debug">Debug</option>
                                        <option value="info">Info</option>
                                        <option value="warn">Warning</option>
                                        <option value="error">Error</option>
                                        <option value="success">Success</option>
                                    </select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <select
                                        value={selectedComponent}
                                        onChange={(e) => setSelectedComponent(e.target.value)}
                                        className="border rounded px-2 py-1 text-sm"
                                    >
                                        <option value="all">All Components</option>
                                        {getUniqueComponents().map(component => (
                                            <option key={component} value={component}>
                                                {component}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Button size="sm" variant="outline" onClick={handleRefreshLogs}>
                                    <RefreshCw className="w-4 h-4 mr-1" />
                                    Refresh
                                </Button>
                            </div>

                            {/* Log Display */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">
                                            {filteredLogs.length} console logs
                                        </span>
                                        <div className="flex space-x-2">
                                            <Button size="sm" variant="outline" onClick={handleExportLogs}>
                                                <Download className="w-4 h-4 mr-1" />
                                                Export
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={handleClearLogs}>
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Clear
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ScrollArea className="h-96">
                                        {filteredLogs.length > 0 ? (
                                            filteredLogs.slice().reverse().map((log, index) => (
                                                <LogEntry key={index} log={log} />
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-gray-500">
                                                No logs found
                                            </div>
                                        )}
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="electron" className="space-y-4">
                            {electronLogInfo.available ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-medium">Electron Log Files</h3>
                                        <div className="flex space-x-2">
                                            <Button size="sm" variant="outline" onClick={loadElectronLogs}>
                                                <RefreshCw className="w-4 h-4 mr-1" />
                                                Load Logs
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={handleExportElectronLogs}>
                                                <Download className="w-4 h-4 mr-1" />
                                                Export
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-sm flex items-center">
                                                    <FileText className="w-4 h-4 mr-2" />
                                                    Main Process Log
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ScrollArea className="h-64">
                                                    <pre className="text-xs whitespace-pre-wrap">
                                                        {electronLogs.main || 'Click "Load Logs" to view content'}
                                                    </pre>
                                                </ScrollArea>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-sm flex items-center">
                                                    <FileText className="w-4 h-4 mr-2" />
                                                    Template System Log
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ScrollArea className="h-64">
                                                    <pre className="text-xs whitespace-pre-wrap">
                                                        {electronLogs.template || 'Click "Load Logs" to view content'}
                                                    </pre>
                                                </ScrollArea>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {electronLogInfo.paths && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-sm">Log File Paths</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <div>
                                                    <span className="font-medium">Main Log:</span>
                                                    <code className="ml-2 text-xs bg-gray-100 px-1 rounded">
                                                        {electronLogInfo.paths.main}
                                                    </code>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Template Log:</span>
                                                    <code className="ml-2 text-xs bg-gray-100 px-1 rounded">
                                                        {electronLogInfo.paths.template}
                                                    </code>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Logs Directory:</span>
                                                    <code className="ml-2 text-xs bg-gray-100 px-1 rounded">
                                                        {electronLogInfo.paths.logsDir}
                                                    </code>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Electron Logging Not Available
                                    </h3>
                                    <p className="text-gray-500">
                                        This feature is only available when running in Electron environment.
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="system" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Current Configuration</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div>
                                            <span className="font-medium">Selected Template:</span>
                                            <Badge className="ml-2">{currentTemplate || 'Loading...'}</Badge>
                                        </div>
                                        <div>
                                            <span className="font-medium">Session ID:</span>
                                            <code className="ml-2 text-xs bg-gray-100 px-1 rounded">
                                                {systemInfo.sessionId}
                                            </code>
                                        </div>
                                        <div>
                                            <span className="font-medium">Available Templates:</span>
                                            <span className="ml-2">{systemInfo.availableTemplates}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Electron Environment:</span>
                                            <Badge variant={systemInfo.isElectron ? "default" : "secondary"} className="ml-2">
                                                {systemInfo.isElectron ? "Yes" : "No"}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Template Registry</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-1">
                                            {systemInfo.templateNames?.map(name => (
                                                <Badge key={name} variant="outline" className="mr-1 mb-1">
                                                    {name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="tools" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Debug Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={generateSummaryReport}
                                            className="w-full"
                                        >
                                            Generate Summary Report
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                console.log('Template Logger Instance:', templateLogger);
                                                console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(templateLogger)));
                                                console.log('Electron Log Available:', window.electronLog ? 'Yes' : 'No');
                                            }}
                                            className="w-full"
                                        >
                                            Log Debug Info to Console
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={loadSystemInfo}
                                            className="w-full"
                                        >
                                            Refresh System Info
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Test Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                templateLogger.debug('DebugPanel', 'Test debug log');
                                                loadLogs();
                                            }}
                                            className="w-full"
                                        >
                                            Add Test Debug Log
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                templateLogger.success('DebugPanel', 'Test success log');
                                                loadLogs();
                                            }}
                                            className="w-full"
                                        >
                                            Add Test Success Log
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                templateLogger.error('DebugPanel', 'Test error log', new Error('Test error'));
                                                loadLogs();
                                            }}
                                            className="w-full"
                                        >
                                            Add Test Error Log
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default TemplateDebugPanel; 