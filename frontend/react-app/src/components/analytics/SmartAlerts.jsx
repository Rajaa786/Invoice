import React, { useState, useEffect, useMemo } from "react";
import {
    AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown,
    Zap, Bell, Target, Users, DollarSign, Calendar, Shield,
    ArrowUpRight, ArrowDownRight, Activity, Eye, Settings, RefreshCw, Loader
} from "lucide-react";
import { useSmartAlerts } from "../../hooks/useAnalytics";
import { useToast } from "../../hooks/use-toast";

// Enhanced smart alerts with AI-powered insights
const smartAlerts = [
    {
        id: 1,
        type: "critical",
        category: "Cash Flow",
        title: "Critical Cash Flow Alert",
        message: "Projected cash shortfall of ₹2.5L in next 15 days based on current receivables pattern",
        severity: "High",
        priority: "Urgent",
        confidence: 92,
        impact: "High",
        timeframe: "15 days",
        actions: [
            "Accelerate collections from top 3 customers",
            "Consider short-term financing options",
            "Review payment terms with suppliers"
        ],
        relatedMetrics: ["DSO: 45 days", "Collection Rate: 68%", "Overdue: ₹8.2L"],
        timestamp: "2 hours ago",
        status: "Active",
        source: "AI Prediction Model",
        affectedEntities: ["TechCorp Solutions", "Manufacturing Plus"]
    },
    {
        id: 2,
        type: "warning",
        category: "Customer Risk",
        title: "Customer Payment Deterioration",
        message: "ServiceHub Ltd showing 35% increase in payment delays over last 3 months",
        severity: "Medium",
        priority: "High",
        confidence: 88,
        impact: "Medium",
        timeframe: "30 days",
        actions: [
            "Schedule payment discussion meeting",
            "Review credit terms and limits",
            "Consider payment plan options"
        ],
        relatedMetrics: ["Avg Delay: 68 days", "Risk Score: 55", "Outstanding: ₹95K"],
        timestamp: "4 hours ago",
        status: "Active",
        source: "Payment Behavior Analysis",
        affectedEntities: ["ServiceHub Ltd"]
    },
    {
        id: 3,
        type: "opportunity",
        category: "Revenue Growth",
        title: "Upselling Opportunity Detected",
        message: "Global Enterprises showing 40% increase in order frequency - potential for premium service upgrade",
        severity: "Low",
        priority: "Medium",
        confidence: 85,
        impact: "High",
        timeframe: "60 days",
        actions: [
            "Prepare premium service proposal",
            "Schedule strategic account review",
            "Analyze competitive positioning"
        ],
        relatedMetrics: ["Growth Rate: 40%", "Satisfaction: 4.8/5", "LTV: ₹12L"],
        timestamp: "6 hours ago",
        status: "Active",
        source: "Customer Intelligence",
        affectedEntities: ["Global Enterprises"]
    },
    {
        id: 4,
        type: "info",
        category: "Tax Compliance",
        title: "Upcoming GST Filing Deadline",
        message: "GST return filing due in 5 days - all invoices processed and ready for submission",
        severity: "Low",
        priority: "Medium",
        confidence: 100,
        impact: "Low",
        timeframe: "5 days",
        actions: [
            "Review final GST calculations",
            "Prepare supporting documentation",
            "Schedule filing with tax consultant"
        ],
        relatedMetrics: ["Tax Liability: ₹86K", "Input Credit: ₹15K", "Net Payable: ₹71K"],
        timestamp: "8 hours ago",
        status: "Pending",
        source: "Compliance Monitor",
        affectedEntities: ["All Companies"]
    },
    {
        id: 5,
        type: "success",
        category: "Performance",
        title: "Collection Efficiency Improved",
        message: "DSO reduced by 8 days this month - best performance in 6 months",
        severity: "Low",
        priority: "Low",
        confidence: 95,
        impact: "Medium",
        timeframe: "Current",
        actions: [
            "Document successful practices",
            "Share insights with team",
            "Consider scaling strategies"
        ],
        relatedMetrics: ["DSO: 28 days", "Collection Rate: 79%", "Cash Flow: +₹45L"],
        timestamp: "1 day ago",
        status: "Acknowledged",
        source: "Performance Analytics",
        affectedEntities: ["All Companies"]
    },
    {
        id: 6,
        type: "critical",
        category: "Invoice Aging",
        title: "High-Value Invoice Overdue",
        message: "₹2.8L invoice from Manufacturing Plus overdue by 45 days - immediate action required",
        severity: "High",
        priority: "Critical",
        confidence: 100,
        impact: "High",
        timeframe: "Immediate",
        actions: [
            "Initiate urgent collection call",
            "Send formal notice",
            "Consider legal consultation"
        ],
        relatedMetrics: ["Amount: ₹2.8L", "Days Overdue: 45", "Customer Risk: High"],
        timestamp: "30 minutes ago",
        status: "New",
        source: "Aging Monitor",
        affectedEntities: ["Manufacturing Plus"]
    }
];

// Alert configuration settings
const alertSettings = {
    cashFlowThreshold: 500000,
    customerRiskThreshold: 40,
    invoiceAgingThreshold: 30,
    enablePredictive: true,
    enableEmailNotifications: true,
    enableSMSAlerts: false,
    confidenceThreshold: 80
};

const ALERT_TYPES = {
    critical: {
        icon: AlertTriangle,
        color: "red",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-800",
        iconColor: "text-red-600"
    },
    warning: {
        icon: AlertTriangle,
        color: "amber",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        textColor: "text-amber-800",
        iconColor: "text-amber-600"
    },
    opportunity: {
        icon: TrendingUp,
        color: "emerald",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        textColor: "text-emerald-800",
        iconColor: "text-emerald-600"
    },
    info: {
        icon: Clock,
        color: "blue",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        textColor: "text-blue-800",
        iconColor: "text-blue-600"
    },
    success: {
        icon: CheckCircle,
        color: "green",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        textColor: "text-green-800",
        iconColor: "text-green-600"
    }
};

const PRIORITY_COLORS = {
    "Critical": "text-red-700 bg-red-100",
    "Urgent": "text-red-600 bg-red-50",
    "High": "text-amber-700 bg-amber-100",
    "Medium": "text-blue-700 bg-blue-100",
    "Low": "text-gray-700 bg-gray-100"
};

const AlertCard = ({ alert, isSelected, onClick, onAction }) => {
    const alertType = ALERT_TYPES[alert.type];
    const IconComponent = alertType.icon;

    return (
        <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${isSelected
                ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                : `${alertType.borderColor} ${alertType.bgColor} hover:shadow-md`
                }`}
            onClick={() => onClick(alert)}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <IconComponent className={`w-5 h-5 ${alertType.iconColor}`} />
                    <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[alert.priority]}`}>
                            {alert.priority}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{alert.timestamp}</span>
                    <div className={`w-2 h-2 rounded-full ${alert.status === 'New' ? 'bg-red-500' :
                        alert.status === 'Active' ? 'bg-amber-500' :
                            alert.status === 'Pending' ? 'bg-blue-500' : 'bg-green-500'
                        }`} />
                </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
                <div>
                    <h4 className={`font-semibold ${alertType.textColor} mb-1`}>{alert.title}</h4>
                    <p className="text-sm text-gray-700">{alert.message}</p>
                </div>

                {/* Metrics */}
                <div className="flex flex-wrap gap-2">
                    {alert.relatedMetrics.slice(0, 2).map((metric, index) => (
                        <span key={index} className="text-xs bg-white px-2 py-1 rounded-md border">
                            {metric}
                        </span>
                    ))}
                </div>

                {/* Confidence & Impact */}
                <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">
                            Confidence: <span className="font-medium">{alert.confidence}%</span>
                        </span>
                        <span className="text-gray-600">
                            Impact: <span className={`font-medium ${alert.impact === 'High' ? 'text-red-600' :
                                alert.impact === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                                }`}>{alert.impact}</span>
                        </span>
                    </div>
                    <span className="text-gray-500">{alert.category}</span>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAction(alert.id, 'acknowledge');
                        }}
                        className="text-xs px-3 py-1 bg-white border rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Acknowledge
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAction(alert.id, 'snooze');
                        }}
                        className="text-xs px-3 py-1 bg-white border rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Snooze
                    </button>
                </div>
            </div>
        </div>
    );
};

const AlertInsights = ({ alerts, summary, loading }) => {
    // Use summary data if available, otherwise calculate from alerts
    const totalAlerts = summary?.total ?? alerts.length;
    const criticalAlerts = summary?.critical ?? alerts.filter(a => a.type === 'critical').length;
    const highPriorityAlerts = alerts.filter(a => a.priority === 'High' || a.priority === 'Critical' || a.priority === 'Urgent').length;
    const avgConfidence = summary?.avgConfidence ?? (totalAlerts > 0 ? (alerts.reduce((sum, a) => sum + (a.confidence || 0), 0) / totalAlerts).toFixed(1) : 0);
    const newAlerts = summary?.newAlerts ?? alerts.filter(a => a.status === 'New').length;

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-pulse">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-4 h-4 bg-gray-300 rounded"></div>
                            <div className="h-4 bg-gray-300 rounded w-20"></div>
                        </div>
                        <div className="h-8 bg-gray-300 rounded w-12"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Critical Alerts</span>
                </div>
                <span className="text-2xl font-bold text-red-900">{criticalAlerts}</span>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">High Priority</span>
                </div>
                <span className="text-2xl font-bold text-amber-900">{highPriorityAlerts}</span>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">New Alerts</span>
                </div>
                <span className="text-2xl font-bold text-blue-900">{newAlerts}</span>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Avg Confidence</span>
                </div>
                <span className="text-2xl font-bold text-purple-900">{avgConfidence}%</span>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">Total Active</span>
                </div>
                <span className="text-2xl font-bold text-emerald-900">{totalAlerts}</span>
            </div>
        </div>
    );
};

export default function SmartAlerts() {
    const [viewMode, setViewMode] = useState('all'); // all, critical, opportunities, settings
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [filters, setFilters] = useState({});

    // Real-time data integration
    const {
        data,
        loading,
        error,
        refetch,
        alerts: realTimeAlerts,
        summary,
        criticalAlerts,
        warningAlerts,
        opportunityAlerts,
        newAlerts
    } = useSmartAlerts(filters);

    const { toast } = useToast();

    // Auto-refresh functionality
    useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, [refetch]);

    const handleAlertAction = (alertId, action) => {
        console.log(`Executing action "${action}" for alert ${alertId}`);
        toast({
            title: "Action Executed",
            description: `${action} has been initiated for the selected alert.`,
        });
        // Here you would implement the actual action logic
    };

    // Use real-time alerts or fallback to mock data
    const alerts = realTimeAlerts && realTimeAlerts.length > 0 ? realTimeAlerts : smartAlerts;

    const filteredAlerts = alerts.filter(alert => {
        if (viewMode === 'critical') return alert.type === 'critical' || alert.priority === 'Critical';
        if (viewMode === 'opportunities') return alert.type === 'opportunity';
        return true;
    });

    // Determine if we have no data
    const hasNoData = !loading && (!alerts || alerts.length === 0);

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
            {/* Header - Following established pattern */}
            <div className="border-b border-gray-200 pb-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-violet-100 rounded-lg">
                                <Bell className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    Smart Alerts Intelligence
                                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                        {loading ? 'LOADING' : error ? 'ERROR' : 'LIVE'}
                                    </div>
                                    {!hasNoData && (
                                        <span className="bg-violet-100 text-violet-700 px-2 py-1 rounded-full text-xs font-medium">
                                            {summary?.total || alerts.length}
                                        </span>
                                    )}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    AI-powered business intelligence • Auto-refresh every 30s
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={refetch}
                            disabled={loading}
                            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            Refresh
                        </button>

                        <div className="flex bg-gray-100 rounded-lg p-1">
                            {[
                                { key: 'all', label: 'All', icon: Bell },
                                { key: 'critical', label: 'Critical', icon: AlertTriangle },
                                { key: 'opportunities', label: 'Opportunities', icon: TrendingUp },
                                { key: 'settings', label: 'Settings', icon: Settings }
                            ].map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setViewMode(key)}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${viewMode === key
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics - Always visible */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-600">Critical Alerts</p>
                            <p className="text-2xl font-bold text-red-700">
                                {summary?.critical || criticalAlerts.length || alerts.filter(a => a.type === 'critical').length}
                            </p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-amber-600">Warnings</p>
                            <p className="text-2xl font-bold text-amber-700">
                                {summary?.warnings || warningAlerts.length || alerts.filter(a => a.type === 'warning').length}
                            </p>
                        </div>
                        <Clock className="w-8 h-8 text-amber-500" />
                    </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-emerald-600">Opportunities</p>
                            <p className="text-2xl font-bold text-emerald-700">
                                {summary?.opportunities || opportunityAlerts.length || alerts.filter(a => a.type === 'opportunity').length}
                            </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-emerald-500" />
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600">New Alerts</p>
                            <p className="text-2xl font-bold text-blue-700">
                                {summary?.newAlerts || newAlerts.length || alerts.filter(a => a.status === 'New').length}
                            </p>
                        </div>
                        <Bell className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
            </div>

            {/* AI Insights - Always visible with violet gradient */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-violet-100 rounded-lg">
                        <Zap className="w-5 h-5 text-violet-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-violet-900">AI Intelligence Insights</h4>
                </div>

                {hasNoData ? (
                    <div className="text-center py-8">
                        <Activity className="w-12 h-12 text-violet-400 mx-auto mb-3" />
                        <p className="text-violet-700 font-medium mb-2">No Active Alerts</p>
                        <p className="text-violet-600 text-sm">
                            Your business is running smoothly! Our AI monitoring will alert you when attention is needed.
                        </p>
                        <div className="mt-4 p-3 bg-white/50 rounded-lg border border-violet-200">
                            <p className="text-xs text-violet-600">
                                💡 Tip: Configure alert thresholds in settings to customize monitoring sensitivity
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/60 rounded-lg p-4 border border-violet-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="w-4 h-4 text-violet-600" />
                                    <span className="font-medium text-violet-900">Alert Distribution</span>
                                </div>
                                <p className="text-sm text-violet-700">
                                    {summary?.critical || 0} critical, {summary?.warnings || 0} warnings, {summary?.opportunities || 0} opportunities detected
                                </p>
                            </div>

                            <div className="bg-white/60 rounded-lg p-4 border border-violet-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-4 h-4 text-violet-600" />
                                    <span className="font-medium text-violet-900">Confidence Score</span>
                                </div>
                                <p className="text-sm text-violet-700">
                                    Average {Math.round(summary?.avgConfidence || 85)}% confidence across all alerts
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/60 rounded-lg p-4 border border-violet-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="w-4 h-4 text-violet-600" />
                                <span className="font-medium text-violet-900">Smart Recommendations</span>
                            </div>
                            <p className="text-sm text-violet-700">
                                {summary?.critical > 0
                                    ? "Focus on critical alerts first - they require immediate attention for business continuity."
                                    : summary?.opportunities > 0
                                        ? "Great opportunity to grow! Review opportunity alerts to maximize business potential."
                                        : "Monitor warning alerts to prevent escalation and maintain optimal performance."
                                }
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Alert Insights */}
            <AlertInsights alerts={alerts} summary={summary} loading={loading} />

            {/* Main Content */}
            {viewMode !== 'settings' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Alert Cards */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            {viewMode === 'critical' ? 'Critical Alerts' :
                                viewMode === 'opportunities' ? 'Growth Opportunities' : 'All Alerts'}
                            {loading && <Loader className="w-4 h-4 animate-spin text-gray-500" />}
                        </h4>

                        {error ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                <p className="text-red-700 font-medium">Failed to load alerts</p>
                                <p className="text-red-600 text-sm">{error}</p>
                                <button
                                    onClick={refetch}
                                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : filteredAlerts.length === 0 ? (
                            <div className="bg-gray-50 rounded-lg p-8 text-center">
                                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 font-medium">No alerts found</p>
                                <p className="text-gray-500 text-sm">
                                    {viewMode === 'critical' ? 'No critical alerts at this time' :
                                        viewMode === 'opportunities' ? 'No opportunities detected' : 'All clear! No alerts to display'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {filteredAlerts.map((alert) => (
                                    <AlertCard
                                        key={alert.id}
                                        alert={alert}
                                        isSelected={selectedAlert?.id === alert.id}
                                        onClick={setSelectedAlert}
                                        onAction={handleAlertAction}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Alert Details */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Alert Details</h4>
                        {selectedAlert ? (
                            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                <div>
                                    <h5 className="font-semibold text-gray-900 mb-2">{selectedAlert.title}</h5>
                                    <p className="text-sm text-gray-700 mb-3">{selectedAlert.message}</p>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Source:</span>
                                            <div className="font-medium">{selectedAlert.source}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Timeframe:</span>
                                            <div className="font-medium">{selectedAlert.timeframe}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Confidence:</span>
                                            <div className="font-medium">{selectedAlert.confidence}%</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Impact:</span>
                                            <div className={`font-medium ${selectedAlert.impact === 'High' ? 'text-red-600' :
                                                selectedAlert.impact === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                                                }`}>{selectedAlert.impact}</div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h6 className="font-semibold text-gray-900 mb-2">Related Metrics</h6>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAlert.relatedMetrics.map((metric, index) => (
                                            <span key={index} className="text-xs bg-white px-2 py-1 rounded-md border">
                                                {metric}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h6 className="font-semibold text-gray-900 mb-2">Affected Entities</h6>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAlert.affectedEntities.map((entity, index) => (
                                            <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                                                {entity}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h6 className="font-semibold text-gray-900 mb-2">Recommended Actions</h6>
                                    <div className="space-y-2">
                                        {selectedAlert.actions.map((action, index) => (
                                            <div key={index} className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></div>
                                                <span className="text-sm text-gray-700">{action}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => handleAlertAction(selectedAlert.id, 'acknowledge')}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        Mark as Acknowledged
                                    </button>
                                    <button
                                        onClick={() => handleAlertAction(selectedAlert.id, 'snooze')}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                                    >
                                        Snooze for 1 Hour
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-8 text-center">
                                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">Select an alert to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Settings Panel */}
            {viewMode === 'settings' && (
                <div className="space-y-6">
                    <h4 className="font-semibold text-gray-900">Alert Configuration</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-semibold text-gray-900 mb-3">Threshold Settings</h5>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Cash Flow Alert Threshold</label>
                                    <input
                                        type="number"
                                        value={alertSettings.cashFlowThreshold}
                                        className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                        placeholder="Amount in ₹"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Customer Risk Threshold</label>
                                    <input
                                        type="number"
                                        value={alertSettings.customerRiskThreshold}
                                        className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                        placeholder="Risk score (0-100)"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Invoice Aging Threshold</label>
                                    <input
                                        type="number"
                                        value={alertSettings.invoiceAgingThreshold}
                                        className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                        placeholder="Days overdue"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-semibold text-gray-900 mb-3">Notification Preferences</h5>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Enable Predictive Alerts</span>
                                    <input
                                        type="checkbox"
                                        checked={alertSettings.enablePredictive}
                                        className="rounded"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                                    <input
                                        type="checkbox"
                                        checked={alertSettings.enableEmailNotifications}
                                        className="rounded"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">SMS Alerts</span>
                                    <input
                                        type="checkbox"
                                        checked={alertSettings.enableSMSAlerts}
                                        className="rounded"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Minimum Confidence Level</label>
                                    <input
                                        type="range"
                                        min="50"
                                        max="100"
                                        value={alertSettings.confidenceThreshold}
                                        className="w-full mt-1"
                                    />
                                    <div className="text-xs text-gray-600 mt-1">{alertSettings.confidenceThreshold}%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Save Settings
                        </button>
                        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                            Reset to Defaults
                        </button>
                    </div>
                </div>
            )}

            {/* AI Intelligence Summary */}
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-semibold text-gray-900">AI Alert Intelligence</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                        <Target className="w-4 h-4 text-indigo-600 mt-0.5" />
                        <span className="text-gray-700">
                            <strong>Predictive Accuracy:</strong> 92% success rate in forecasting cash flow issues 15+ days ahead.
                        </span>
                    </div>
                    <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600 mt-0.5" />
                        <span className="text-gray-700">
                            <strong>Opportunity Detection:</strong> Identified ₹12L in potential revenue growth opportunities.
                        </span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                        <span className="text-gray-700">
                            <strong>Risk Prevention:</strong> Early warnings prevented ₹8.5L in potential bad debt this quarter.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
} 