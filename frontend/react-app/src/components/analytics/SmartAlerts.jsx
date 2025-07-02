import React, { useState, useEffect, useMemo } from "react";
import {
    AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown,
    Zap, Bell, Target, Users, DollarSign, Calendar, Shield,
    ArrowUpRight, ArrowDownRight, Activity, Eye, Settings, RefreshCw,
    Loader, Info
} from "lucide-react";
import { useSmartAlerts } from "../../hooks/useAnalytics";
import { useToast } from "../../hooks/use-toast";

const SmartAlerts = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [debugMode, setDebugMode] = useState(false);

    const {
        data: alertsData,
        loading,
        error,
        refetch
    } = useSmartAlerts({}, { enabled: true, refetchInterval: 30000 });

    const { toast } = useToast();

    // Process alerts data - only use real data from backend
    const processedData = useMemo(() => {
        if (!alertsData || error) {
            console.log('🔍 SmartAlerts Debug - No data received:', error?.message || 'No data');
            return {
                alerts: [],
                summary: {
                    total: 0,
                    critical: 0,
                    warnings: 0,
                    opportunities: 0,
                    newAlerts: 0,
                    avgConfidence: 0
                },
                hasRealData: false,
                debugInfo: {
                    error: error?.message,
                    dataReceived: false,
                    alertsReceived: 0
                }
            };
        }

        const alerts = alertsData.alerts || [];
        const summary = alertsData.summary || {};

        console.log('🔍 SmartAlerts Debug - Data received:', {
            alertCount: alerts.length,
            summary,
            metadata: alertsData.metadata
        });

        return {
            alerts,
            summary: {
                total: Number(summary.total || 0),
                critical: Number(summary.critical || 0),
                warnings: Number(summary.warnings || 0),
                opportunities: Number(summary.opportunities || 0),
                newAlerts: Number(summary.newAlerts || 0),
                avgConfidence: Number(summary.avgConfidence || 0)
            },
            hasRealData: true,
            debugInfo: {
                originalAlertCount: alerts.length,
                summaryReceived: !!alertsData.summary,
                metadataReceived: !!alertsData.metadata,
                lastGenerated: alertsData.metadata?.generatedAt
            }
        };
    }, [alertsData, error]);

    // Filtered alerts based on category and priority
    const filteredAlerts = useMemo(() => {
        return processedData.alerts.filter(alert => {
            const categoryMatch = selectedCategory === 'all' || alert.category === selectedCategory;
            const priorityMatch = selectedPriority === 'all' || alert.priority === selectedPriority;
            return categoryMatch && priorityMatch;
        });
    }, [processedData.alerts, selectedCategory, selectedPriority]);

    // Get unique categories and priorities for filters
    const categories = useMemo(() => {
        if (processedData.alerts.length === 0) return ['all'];
        const cats = [...new Set(processedData.alerts.map(a => a.category))];
        return ['all', ...cats];
    }, [processedData.alerts]);

    const priorities = useMemo(() => {
        if (processedData.alerts.length === 0) return ['all'];
        const prios = [...new Set(processedData.alerts.map(a => a.priority))];
        return ['all', ...prios.sort((a, b) => {
            const order = { 'Critical': 4, 'Urgent': 3, 'High': 2, 'Medium': 1, 'Low': 0 };
            return order[b] - order[a];
        })];
    }, [processedData.alerts]);

    const handleRefresh = async () => {
        try {
            setRefreshKey(prev => prev + 1);
            await refetch();
            toast({
                title: "Alerts Refreshed",
                description: "Smart alerts have been updated with the latest data.",
            });
        } catch (error) {
            toast({
                title: "Refresh Failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleAlertAction = (alert, actionIndex) => {
        const action = alert.actions[actionIndex];
        toast({
            title: "Action Noted",
            description: `Recommended action: ${action}`,
        });
    };

    const getAlertIcon = (type) => {
        switch (type) {
            case 'critical': return AlertTriangle;
            case 'warning': return AlertTriangle;
            case 'opportunity': return Target;
            case 'success': return CheckCircle;
            case 'info': return Info;
            default: return Bell;
        }
    };

    const getAlertColor = (type) => {
        switch (type) {
            case 'critical': return 'text-red-600 bg-red-50 border-red-200';
            case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'opportunity': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'success': return 'text-green-600 bg-green-50 border-green-200';
            case 'info': return 'text-gray-600 bg-gray-50 border-gray-200';
            default: return 'text-blue-600 bg-blue-50 border-blue-200';
        }
    };

    const getPriorityBadgeColor = (priority) => {
        switch (priority) {
            case 'Critical': return 'bg-red-100 text-red-800';
            case 'Urgent': return 'bg-orange-100 text-orange-800';
            case 'High': return 'bg-yellow-100 text-yellow-800';
            case 'Medium': return 'bg-blue-100 text-blue-800';
            case 'Low': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Smart Alerts
                    </h3>
                </div>
                <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-gray-500">
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>Loading intelligent alerts...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Header with controls */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Smart Alerts
                    </h3>
                    {debugMode && (
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Debug: {JSON.stringify(processedData.debugInfo, null, 0)}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setDebugMode(!debugMode)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        title="Toggle Debug Mode"
                    >
                        <Settings className="h-4 w-4" />
                    </button>
                    {processedData.alerts.length > 0 && (
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            title="Toggle Filters"
                        >
                            <Eye className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        onClick={handleRefresh}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        title="Refresh Alerts"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Summary metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{processedData.summary.total}</div>
                    <div className="text-sm text-gray-600">Total Alerts</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{processedData.summary.critical}</div>
                    <div className="text-sm text-red-700">Critical</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{processedData.summary.warnings}</div>
                    <div className="text-sm text-yellow-700">Warnings</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{processedData.summary.opportunities}</div>
                    <div className="text-sm text-blue-700">Opportunities</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                        {processedData.summary.avgConfidence > 0 ? `${Math.round(processedData.summary.avgConfidence)}%` : '—'}
                    </div>
                    <div className="text-sm text-green-700">Confidence</div>
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-red-900 mb-1">Alert System Error</h4>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters - only show if there are alerts */}
            {showFilters && processedData.alerts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                        <select
                            value={selectedPriority}
                            onChange={(e) => setSelectedPriority(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {priorities.map(prio => (
                                <option key={prio} value={prio}>
                                    {prio === 'all' ? 'All Priorities' : prio}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Main content area */}
            {processedData.alerts.length === 0 ? (
                /* No alerts state */
                <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h4 className="text-xl font-medium text-gray-900 mb-3">No Active Alerts</h4>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Your business metrics are within normal ranges. The smart alert system is monitoring and will notify you of any issues or opportunities.
                    </p>

                    {/* Alert thresholds information */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
                        <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div className="text-left">
                                <h5 className="font-medium text-blue-900 mb-3">Smart Alert Conditions</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                                    <div>
                                        <h6 className="font-medium mb-2">Cash Flow Alerts</h6>
                                        <ul className="space-y-1 text-xs">
                                            <li>• Critical: Total outstanding > ₹10L with ₹5L+ overdue (90+ days)</li>
                                            <li>• Warning: Total outstanding > ₹5L with ₹3L+ aged receivables</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h6 className="font-medium mb-2">Customer Risk Alerts</h6>
                                        <ul className="space-y-1 text-xs">
                                            <li>• High-risk customers with ₹50K+ overdue amounts</li>
                                            <li>• Payment delays > 60 days with poor payment rates</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h6 className="font-medium mb-2">Invoice Aging Alerts</h6>
                                        <ul className="space-y-1 text-xs">
                                            <li>• Critical: ₹2L+ in 90+ days aging bucket</li>
                                            <li>• Warning: ₹3L+ in 61-90 days aging bucket</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h6 className="font-medium mb-2">Growth Opportunities</h6>
                                        <ul className="space-y-1 text-xs">
                                            <li>• High-performing customers ready for upselling</li>
                                            <li>• High-margin products with scaling potential</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Alerts list */
                <div className="space-y-4">
                    {filteredAlerts.length === 0 ? (
                        <div className="text-center py-8">
                            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">No Alerts Match Filters</h4>
                            <p className="text-gray-600">Try adjusting your filter criteria to see more alerts.</p>
                        </div>
                    ) : (
                        filteredAlerts.map((alert) => {
                            const IconComponent = getAlertIcon(alert.type);
                            const alertColorClass = getAlertColor(alert.type);

                            return (
                                <div
                                    key={alert.id}
                                    className={`border rounded-lg p-4 ${alertColorClass}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            <IconComponent className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-medium">{alert.title}</h4>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeColor(alert.priority)}`}>
                                                        {alert.priority}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{alert.category}</span>
                                                </div>
                                                <p className="text-sm mb-3">{alert.message}</p>

                                                {/* Alert details */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                                    <div>
                                                        <strong>Impact:</strong> {alert.impact} |
                                                        <strong> Confidence:</strong> {alert.confidence}% |
                                                        <strong> Timeframe:</strong> {alert.timeframe}
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-gray-500">{alert.timestamp}</span>
                                                    </div>
                                                </div>

                                                {/* Related metrics */}
                                                {alert.relatedMetrics && alert.relatedMetrics.length > 0 && (
                                                    <div className="mt-3">
                                                        <div className="text-xs font-medium mb-1">Key Metrics:</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {alert.relatedMetrics.map((metric, idx) => (
                                                                <span key={idx} className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                                                                    {metric}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Recommended actions */}
                                                {alert.actions && alert.actions.length > 0 && (
                                                    <div className="mt-3">
                                                        <div className="text-xs font-medium mb-2">Recommended Actions:</div>
                                                        <div className="space-y-1">
                                                            {alert.actions.slice(0, 3).map((action, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => handleAlertAction(alert, idx)}
                                                                    className="block text-xs text-left hover:underline"
                                                                >
                                                                    • {action}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Debug information panel */}
            {debugMode && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Debug Information</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Has Real Data:</strong> {processedData.hasRealData ? 'Yes' : 'No'}</div>
                        <div><strong>Total Alerts:</strong> {processedData.alerts.length}</div>
                        <div><strong>Filtered Alerts:</strong> {filteredAlerts.length}</div>
                        <div><strong>Selected Category:</strong> {selectedCategory}</div>
                        <div><strong>Selected Priority:</strong> {selectedPriority}</div>
                        <div><strong>Error:</strong> {error?.message || 'None'}</div>
                        <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
                        <div><strong>Last Generated:</strong> {processedData.debugInfo?.lastGenerated || 'Unknown'}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartAlerts; 