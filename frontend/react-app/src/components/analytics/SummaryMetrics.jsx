import React, { useState, useEffect, useMemo } from "react";
import {
    TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock,
    DollarSign, Users, FileText, Target, Zap, RefreshCw, AlertCircle,
    Minus, BarChart3, PieChart, Activity
} from "lucide-react";
import { useSummaryMetrics, useAnalyticsFilters } from "../../hooks/useAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Skeleton } from "../ui/skeleton";

const getColorClasses = (color, variant = 'bg') => {
    const colors = {
        emerald: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            icon: 'text-emerald-600',
            text: 'text-emerald-800',
            progress: 'bg-emerald-500',
            light: 'bg-emerald-100'
        },
        blue: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            icon: 'text-blue-600',
            text: 'text-blue-800',
            progress: 'bg-blue-500',
            light: 'bg-blue-100'
        },
        amber: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            icon: 'text-amber-600',
            text: 'text-amber-800',
            progress: 'bg-amber-500',
            light: 'bg-amber-100'
        },
        red: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon: 'text-red-600',
            text: 'text-red-800',
            progress: 'bg-red-500',
            light: 'bg-red-100'
        },
        purple: {
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            icon: 'text-purple-600',
            text: 'text-purple-800',
            progress: 'bg-purple-500',
            light: 'bg-purple-100'
        },
        indigo: {
            bg: 'bg-indigo-50',
            border: 'border-indigo-200',
            icon: 'text-indigo-600',
            text: 'text-indigo-800',
            progress: 'bg-indigo-500',
            light: 'bg-indigo-100'
        }
    };
    return colors[color] || colors.blue;
};

const TrendIndicator = ({ trend, size = "sm" }) => {
    if (!trend || trend === 0) {
        return (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100">
                <Minus className="w-3 h-3 text-gray-600" />
                <span className="text-xs font-semibold text-gray-600">0%</span>
            </div>
        );
    }

    const isPositive = trend > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? "text-emerald-600" : "text-red-600";
    const bgClass = isPositive ? "bg-emerald-100" : "bg-red-100";

    return (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${bgClass}`}>
            <Icon className={`w-3 h-3 ${colorClass}`} />
            <span className={`text-xs font-semibold ${colorClass}`}>
                {Math.abs(trend).toFixed(1)}%
            </span>
        </div>
    );
};

const HealthScoreIndicator = ({ score, size = "sm" }) => {
    if (!score) return null;

    const getHealthColor = (score) => {
        if (score >= 80) return "text-emerald-600";
        if (score >= 60) return "text-amber-600";
        return "text-red-600";
    };

    const getHealthIcon = (score) => {
        if (score >= 80) return CheckCircle;
        if (score >= 60) return Clock;
        return AlertTriangle;
    };

    const Icon = getHealthIcon(score);

    return (
        <div className="flex items-center gap-1">
            <Icon className={`w-3 h-3 ${getHealthColor(score)}`} />
            <span className={`text-xs font-medium ${getHealthColor(score)}`}>
                {score}
            </span>
        </div>
    );
};

const MetricCard = ({
    title,
    value,
    formattedValue,
    previousValue,
    trend,
    target,
    targetProgress,
    icon: Icon,
    color,
    insight,
    healthScore,
    isLoading = false
}) => {
    const colorClasses = getColorClasses(color);

    if (isLoading) {
        return (
            <Card className="relative overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                    <div className="mt-4 space-y-2">
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`relative overflow-hidden border transition-all duration-200 hover:shadow-lg ${colorClasses.border}`}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-600">{title}</h4>
                            {healthScore && <HealthScoreIndicator score={healthScore} />}
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-gray-900">
                                {formattedValue || value}
                            </span>
                            {trend !== undefined && trend !== null && (
                                <TrendIndicator trend={trend} />
                            )}
                        </div>

                        {insight && (
                            <p className="text-xs text-gray-500">{insight}</p>
                        )}
                    </div>

                    <div className={`p-2 rounded-lg ${colorClasses.light}`}>
                        <Icon className={`w-5 h-5 ${colorClasses.icon}`} />
                    </div>
                </div>

                {target && targetProgress !== undefined && (
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Target Progress</span>
                            <span className="font-medium">{targetProgress}%</span>
                        </div>
                        <Progress
                            value={targetProgress}
                            className="h-2"
                        />
                        <p className="text-xs text-gray-500">
                            Target: {target}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default function SummaryMetrics() {
    const [selectedView, setSelectedView] = useState('overview');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const { filters } = useAnalyticsFilters();

    // Fetch real-time data
    const { data, loading, error, refetch, kpiMetrics } = useSummaryMetrics(filters);

    // Auto-refresh functionality
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            refetch();
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, [autoRefresh, refetch]);

    // Transform real data into enhanced metrics
    const enhancedMetrics = useMemo(() => {
        if (!data || !kpiMetrics) return [];

        return [
            {
                title: "Total Revenue",
                value: data.totalRevenue || 0,
                formattedValue: kpiMetrics?.totalRevenue?.formatted || '₹0',
                trend: null, // Calculate from historical data if available
                target: null, // Set targets from configuration
                targetProgress: null,
                icon: DollarSign,
                color: "emerald",
                insight: (data.totalRevenue || 0) > 100000 ? "Strong performance" : "Growing steadily",
                healthScore: Math.min(100, Math.floor(((data.totalRevenue || 0) / 100000) * 100))
            },
            {
                title: "Collection Efficiency",
                value: data.collectionEfficiency || 0,
                formattedValue: kpiMetrics?.collectionEfficiency?.formatted || '0%',
                trend: null,
                target: "90%",
                targetProgress: Math.min(100, (data.collectionEfficiency || 0) / 90 * 100),
                icon: Target,
                color: "blue",
                insight: (data.collectionEfficiency || 0) > 70 ? "Above industry avg" : "Needs improvement",
                healthScore: data.collectionEfficiency || 0
            },
            {
                title: "Payment Rate",
                value: data.paymentRate || 0,
                formattedValue: kpiMetrics?.paymentRate?.formatted || '0%',
                trend: null,
                target: "95%",
                targetProgress: Math.min(100, (data.paymentRate || 0) / 95 * 100),
                icon: CheckCircle,
                color: (data.paymentRate || 0) > 80 ? "emerald" : (data.paymentRate || 0) > 60 ? "amber" : "red",
                insight: (data.paymentRate || 0) > 80 ? "Excellent payment rate" : "Monitor closely",
                healthScore: Math.floor(data.paymentRate || 0)
            },
            {
                title: "Overdue Invoices",
                value: data.overdueInvoices || 0,
                formattedValue: (data.overdueInvoices || 0).toLocaleString(),
                trend: null,
                target: "0",
                targetProgress: Math.max(0, 100 - ((data.overdueInvoices || 0) / (data.totalInvoices || 1) * 100)),
                icon: AlertTriangle,
                color: (data.overdueInvoices || 0) === 0 ? "emerald" : (data.overdueInvoices || 0) < 5 ? "amber" : "red",
                insight: (data.overdueInvoices || 0) === 0 ? "Perfect!" : "Needs attention",
                healthScore: Math.max(0, 100 - ((data.overdueInvoices || 0) / (data.totalInvoices || 1) * 200))
            },
            {
                title: "Active Customers",
                value: data.totalCustomers || 0,
                formattedValue: (data.totalCustomers || 0).toLocaleString(),
                trend: null,
                target: null,
                targetProgress: null,
                icon: Users,
                color: "purple",
                insight: "Customer base growing",
                healthScore: Math.min(100, (data.totalCustomers || 0) * 5)
            },
            {
                title: "Avg Invoice Value",
                value: data.avgInvoiceValue || 0,
                formattedValue: kpiMetrics?.avgInvoiceValue?.formatted || '₹0',
                trend: null,
                target: null,
                targetProgress: null,
                icon: FileText,
                color: "indigo",
                insight: (data.avgInvoiceValue || 0) > 5000 ? "High value deals" : "Focus on upselling",
                healthScore: Math.min(100, Math.floor((data.avgInvoiceValue || 0) / 100))
            }
        ];
    }, [data, kpiMetrics]);

    // Error state
    if (error && !loading) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-center space-x-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span>Failed to load metrics</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refetch}
                        className="ml-2"
                    >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Retry
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Controls */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Financial Performance Dashboard</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Real-time business metrics and KPIs
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Auto-refresh toggle */}
                    <Button
                        variant={autoRefresh ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className="flex items-center space-x-1"
                    >
                        <Activity className="w-4 h-4" />
                        <span>{autoRefresh ? 'Live' : 'Manual'}</span>
                    </Button>

                    {/* Manual refresh button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refetch}
                        disabled={loading}
                        className="flex items-center space-x-1"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </Button>

                    {/* View toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setSelectedView('overview')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedView === 'overview'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <BarChart3 className="w-4 h-4 mr-1 inline" />
                            Overview
                        </button>
                        <button
                            onClick={() => setSelectedView('targets')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedView === 'targets'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Target className="w-4 h-4 mr-1 inline" />
                            Targets
                        </button>
                    </div>
                </div>
            </div>

            {/* Status indicator */}
            {data && (
                <div className="flex items-center space-x-4 text-sm">
                    <Badge variant="outline" className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Live Data</span>
                    </Badge>
                    <span className="text-gray-500">
                        Total Invoices: {data.totalInvoices || 0}
                    </span>
                    <span className="text-gray-500">
                        Companies: {data.totalCompanies || 0}
                    </span>
                </div>
            )}

            {/* Enhanced Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && !data ? (
                    // Loading skeletons
                    Array.from({ length: 6 }).map((_, index) => (
                        <MetricCard key={index} isLoading={true} />
                    ))
                ) : (
                    // Real data cards
                    enhancedMetrics.map((metric, index) => (
                        <MetricCard
                            key={index}
                            {...metric}
                            isLoading={false}
                        />
                    ))
                )}
            </div>

            {/* Quick Insights */}
            {data && !loading && (
                <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <div className="flex items-start space-x-3">
                        <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-blue-900 mb-2">Quick Insights</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                                <div>
                                    • Revenue performance: {data.totalRevenue > 50000 ? 'Strong' : 'Moderate'}
                                </div>
                                <div>
                                    • Collection efficiency: {data.collectionEfficiency > 70 ? 'Good' : 'Needs improvement'}
                                </div>
                                <div>
                                    • Payment behavior: {data.paymentRate > 80 ? 'Excellent' : 'Monitor closely'}
                                </div>
                                <div>
                                    • Outstanding risk: {data.overdueRate < 10 ? 'Low' : 'Moderate'}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
} 