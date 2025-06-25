import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
    useConfiguration,
    useAppConfiguration,
    useUIConfiguration
} from '../../hooks/useConfiguration';

const SettingsDebugger = () => {
    const [debugInfo, setDebugInfo] = useState({});
    const [refreshKey, setRefreshKey] = useState(0);

    const { configService, isInitialized, error } = useConfiguration();
    const { theme, language, loading: appLoading } = useAppConfiguration();
    const { uiPreferences, loading: uiLoading } = useUIConfiguration();

    const refreshDebugInfo = async () => {
        if (!configService) return;

        try {
            const serviceInfo = configService.getServiceInfo();
            const allSettings = await configService.getAllConfiguration();

            setDebugInfo({
                serviceInfo,
                allSettings,
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            console.error('Failed to get debug info:', err);
            setDebugInfo({ error: err.message });
        }
    };

    useEffect(() => {
        if (isInitialized && configService) {
            refreshDebugInfo();
        }
    }, [isInitialized, configService, refreshKey]);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const testSetSetting = async () => {
        if (!configService) return;

        try {
            const testKey = 'ui.autoSave';
            const testValue = !uiPreferences.autoSave;

            console.log(`Testing setting ${testKey} to ${testValue}`);
            const result = await configService.settingsService.set(testKey, testValue);
            console.log('Set result:', result);

            // Verify the setting was saved
            const retrievedValue = await configService.settingsService.get(testKey);
            console.log('Retrieved value:', retrievedValue);

            // Test direct electron settings API
            if (window.electronSettings) {
                console.log('Testing direct electron settings API...');
                const directResult = await window.electronSettings.set(testKey, testValue);
                console.log('Direct set result:', directResult);

                const directRetrieved = await window.electronSettings.get(testKey);
                console.log('Direct retrieved value:', directRetrieved);

                // Get all settings to see what's actually stored
                const allSettings = await window.electronSettings.getAll();
                console.log('All settings from electron:', allSettings);
            }

            handleRefresh();
        } catch (err) {
            console.error('Test failed:', err);
        }
    };

    const testPersistence = async () => {
        if (!window.electronSettings) {
            console.error('Electron settings API not available');
            return;
        }

        try {
            // Get the userData path
            let userDataPath = 'Unknown';
            try {
                userDataPath = await window.electron?.getPath?.('userData');
            } catch (err) {
                console.warn('Could not get userData path:', err);
            }

            console.log('📁 Settings should be saved to:', userDataPath + '/Settings');

            // Test setting a unique value
            const testKey = 'test.persistence';
            const testValue = Date.now().toString();

            console.log(`🧪 Testing persistence with ${testKey} = ${testValue}`);

            const setResult = await window.electronSettings.set(testKey, testValue);
            console.log('✍️ Set result:', setResult);

            // Immediately get it back
            const getResult = await window.electronSettings.get(testKey);
            console.log('📖 Immediate get result:', getResult);

            if (getResult === testValue) {
                console.log('✅ Setting saved and retrieved successfully');
            } else {
                console.error('❌ Setting was not saved correctly');
                console.error('Expected:', testValue);
                console.error('Got:', getResult);
            }

            // Get all settings to see what's actually stored
            const allSettings = await window.electronSettings.getAll();
            console.log('📋 All settings currently stored:', allSettings);
            console.log('📊 Number of settings:', Object.keys(allSettings).length);

            // Test a real UI setting
            console.log('\n🎨 Testing UI settings...');
            const uiAutoSave = await window.electronSettings.get('ui.autoSave');
            console.log('Current ui.autoSave value:', uiAutoSave);

            const applicationTheme = await window.electronSettings.get('application.theme');
            console.log('Current application.theme value:', applicationTheme);

        } catch (err) {
            console.error('❌ Persistence test failed:', err);
        }
    };

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>🔧 Settings Debugger</span>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleRefresh}>
                            Refresh
                        </Button>
                        <Button size="sm" variant="outline" onClick={testSetSetting}>
                            Test Set/Get
                        </Button>
                        <Button size="sm" variant="secondary" onClick={testPersistence}>
                            Test Persistence
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Service Status */}
                    <div className="space-y-2">
                        <h4 className="font-semibold">Service Status</h4>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span>Initialized:</span>
                                <Badge variant={isInitialized ? "default" : "destructive"}>
                                    {isInitialized ? "Yes" : "No"}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Service Available:</span>
                                <Badge variant={configService ? "default" : "destructive"}>
                                    {configService ? "Yes" : "No"}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Error:</span>
                                <Badge variant={error ? "destructive" : "default"}>
                                    {error ? "Yes" : "No"}
                                </Badge>
                            </div>
                            {error && (
                                <div className="text-red-600 text-xs mt-1">
                                    {error.message}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Current Values */}
                    <div className="space-y-2">
                        <h4 className="font-semibold">Current Values</h4>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span>Theme:</span>
                                <Badge>{theme}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Language:</span>
                                <Badge>{language}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Auto Save:</span>
                                <Badge>{uiPreferences.autoSave ? "On" : "Off"}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Compact Mode:</span>
                                <Badge>{uiPreferences.compactMode ? "On" : "Off"}</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading States */}
                <div className="space-y-2">
                    <h4 className="font-semibold">Loading States</h4>
                    <div className="flex gap-2 text-sm">
                        <Badge variant={appLoading ? "destructive" : "default"}>
                            App: {appLoading ? "Loading" : "Ready"}
                        </Badge>
                        <Badge variant={uiLoading ? "destructive" : "default"}>
                            UI: {uiLoading ? "Loading" : "Ready"}
                        </Badge>
                    </div>
                </div>

                {/* Raw Settings Data */}
                {debugInfo.allSettings && (
                    <div className="space-y-2">
                        <h4 className="font-semibold">All Settings ({Object.keys(debugInfo.allSettings).length} keys)</h4>
                        <div className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-48">
                            <pre>{JSON.stringify(debugInfo.allSettings, null, 2)}</pre>
                        </div>
                    </div>
                )}

                {/* Service Info */}
                {debugInfo.serviceInfo && (
                    <div className="space-y-2">
                        <h4 className="font-semibold">Service Info</h4>
                        <div className="bg-gray-100 p-3 rounded text-xs">
                            <pre>{JSON.stringify(debugInfo.serviceInfo, null, 2)}</pre>
                        </div>
                    </div>
                )}

                {debugInfo.timestamp && (
                    <div className="text-xs text-gray-500">
                        Last updated: {debugInfo.timestamp}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SettingsDebugger; 