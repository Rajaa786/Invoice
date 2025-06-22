import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
    ComposedChart, Line, Bar, ReferenceLine, Brush, LineChart
} from "recharts";
import { motion } from "framer-motion";
import {
    TrendingUp, Calendar, Target, AlertCircle, BarChart3, LineChart as LineChartIcon,
    Zap, RefreshCw, Download, Settings, Filter, TrendingDown, Minus,
    Activity, Eye, EyeOff, Info
} from "lucide-react";
import { useRevenueOverTime, useAnalyticsFilters } from "../../hooks/useAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const fadeIn = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } },
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-[200px]">
                <h4 className="font-semibold text-gray-900 mb-2">{label}</h4>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between gap-3 text-sm mb-1">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-gray-600">{entry.name}:</span>
                        </div>
                        <span className="font-semibold">
                            {entry.value ? `₹${(entry.value || 0).toLocaleString()}` : 'N/A'}
                        </span>
                    </div>
                ))}
                {data.invoiceCount && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Invoices:</span>
                            <span>{data.invoiceCount}</span>
                        </div>
                        {data.avgInvoiceValue && (
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Avg Value:</span>
                                <span>₹{Math.round(data.avgInvoiceValue || 0).toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const MetricCard = ({ title, value, change, icon: Icon, color = "blue", loading = false }) => {
    if (loading) {
        return (
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-6 w-16" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const colorClasses = {
        blue: "text-blue-600 bg-blue-100",
        green: "text-green-600 bg-green-100",
        amber: "text-amber-600 bg-amber-100",
        red: "text-red-600 bg-red-100"
    };

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        {change !== undefined && (
                            <div className="flex items-center mt-1">
                                {change > 0 ? (
                                    <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                                ) : change < 0 ? (
                                    <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
                                ) : (
                                    <Minus className="w-3 h-3 text-gray-400 mr-1" />
                                )}
                                <span className={`text-xs font-medium ${change > 0 ? 'text-green-600' :
                                    change < 0 ? 'text-red-600' : 'text-gray-400'
                                    }`}>
                                    {Math.abs(change)}%
                                </span>
                            </div>
                        )}
                    </div>
                    <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function RevenueOverTimeChart() {
    const [viewMode, setViewMode] = useState("revenue");
    const [chartType, setChartType] = useState("area");
    const [timeRange, setTimeRange] = useState("monthly");
    const [showPaidOnly, setShowPaidOnly] = useState(false);
    const [showGrid, setShowGrid] = useState(true);
    const [showLegend, setShowLegend] = useState(true);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const { filters, setFilter } = useAnalyticsFilters();

    // Combine filters with local state
    const apiFilters = useMemo(() => ({
        ...filters,
        period: timeRange,
        status: showPaidOnly ? 'paid' : undefined,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined
    }), [filters, timeRange, showPaidOnly, dateRange]);

    // Fetch real-time data
    const { data, loading, error, refetch, chartData } = useRevenueOverTime(apiFilters);

    // Auto-refresh on filter changes
    useEffect(() => {
        const handleRefresh = () => refetch();
        window.addEventListener('analytics:refresh', handleRefresh);
        window.addEventListener('analytics:forceRefresh', handleRefresh);

        return () => {
            window.removeEventListener('analytics:refresh', handleRefresh);
            window.removeEventListener('analytics:forceRefresh', handleRefresh);
        };
    }, [refetch]);

    // Calculate insights from real data
    const insights = useMemo(() => {
        if (!chartData || chartData.length === 0) return null;

        const totalRevenue = chartData.reduce((sum, d) => sum + Number(d.revenue || 0), 0);
        const totalInvoices = chartData.reduce((sum, d) => sum + Number(d.invoiceCount || 0), 0);
        const avgInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

        // Calculate growth rate (comparing last period with previous)
        let growthRate = 0;
        if (chartData.length >= 2) {
            const current = Number(chartData[chartData.length - 1]?.revenue || 0);
            const previous = Number(chartData[chartData.length - 2]?.revenue || 0);
            growthRate = previous > 0 ? ((current - previous) / previous) * 100 : 0;
        }

        // Find peak and lowest periods
        const revenueValues = chartData.map(d => Number(d.revenue || 0));
        const maxRevenue = Math.max(...revenueValues);
        const minRevenue = Math.min(...revenueValues);
        const peakPeriod = chartData.find(d => Number(d.revenue) === maxRevenue)?.period;
        const lowestPeriod = chartData.find(d => Number(d.revenue) === minRevenue)?.period;

        return {
            totalRevenue,
            totalInvoices,
            avgInvoiceValue,
            growthRate,
            maxRevenue,
            minRevenue,
            peakPeriod,
            lowestPeriod,
            periodsWithData: chartData.length
        };
    }, [chartData]);

    // Chart configuration based on view mode
    const chartConfig = useMemo(() => {
        const configs = {
            revenue: {
                dataKey: 'revenue',
                stroke: '#3B82F6',
                fill: '#3B82F6',
                fillOpacity: 0.1,
                name: 'Revenue'
            },
            invoices: {
                dataKey: 'invoiceCount',
                stroke: '#10B981',
                fill: '#10B981',
                fillOpacity: 0.1,
                name: 'Invoice Count'
            },
            both: [
                {
                    dataKey: 'revenue',
                    stroke: '#3B82F6',
                    fill: '#3B82F6',
                    fillOpacity: 0.1,
                    name: 'Revenue'
                },
                {
                    dataKey: 'paidRevenue',
                    stroke: '#10B981',
                    fill: '#10B981',
                    fillOpacity: 0.1,
                    name: 'Paid Revenue'
                },
                {
                    dataKey: 'pendingRevenue',
                    stroke: '#F59E0B',
                    fill: '#F59E0B',
                    fillOpacity: 0.1,
                    name: 'Pending Revenue'
                }
            ]
        };
        return configs[viewMode] || configs.revenue;
    }, [viewMode]);

    // Export functionality
    const handleExport = useCallback(() => {
        if (!chartData || chartData.length === 0) return;

        const csvContent = [
            ['Period', 'Revenue', 'Invoice Count', 'Avg Invoice Value', 'Paid Revenue', 'Pending Revenue'],
            ...chartData.map(row => [
                row.period,
                row.revenue || 0,
                row.invoiceCount || 0,
                row.avgInvoiceValue || 0,
                row.paidRevenue || 0,
                row.pendingRevenue || 0
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `revenue-over-time-${timeRange}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [chartData, timeRange]);

    // Render chart based on type
    const renderChart = () => {
        if (loading && !chartData) {
            return (
                <div className="h-80 flex items-center justify-center">
                    <div className="space-y-4 w-full">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 font-medium">Failed to load revenue data</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refetch}
                            className="mt-2"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </div>
            );
        }

        if (!chartData || chartData.length === 0) {
            return (
                <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No revenue data available</p>
                        <p className="text-sm text-gray-400">Try adjusting your filters</p>
                    </div>
                </div>
            );
        }

        const commonProps = {
            data: chartData,
            margin: { top: 20, right: 30, left: 20, bottom: 5 }
        };

        if (chartType === 'area') {
            return (
                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart {...commonProps}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
                        <XAxis
                            dataKey="period"
                            fontSize={12}
                            tick={{ fill: '#6B7280' }}
                        />
                        <YAxis
                            fontSize={12}
                            tick={{ fill: '#6B7280' }}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && <Legend />}

                        {Array.isArray(chartConfig) ? (
                            chartConfig.map((config, index) => (
                                <Area
                                    key={index}
                                    type="monotone"
                                    {...config}
                                    strokeWidth={2}
                                />
                            ))
                        ) : (
                            <Area
                                type="monotone"
                                {...chartConfig}
                                strokeWidth={2}
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            );
        }

        if (chartType === 'line') {
            return (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart {...commonProps}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
                        <XAxis
                            dataKey="period"
                            fontSize={12}
                            tick={{ fill: '#6B7280' }}
                        />
                        <YAxis
                            fontSize={12}
                            tick={{ fill: '#6B7280' }}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && <Legend />}

                        {Array.isArray(chartConfig) ? (
                            chartConfig.map((config, index) => (
                                <Line
                                    key={index}
                                    type="monotone"
                                    {...config}
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                />
                            ))
                        ) : (
                            <Line
                                type="monotone"
                                {...chartConfig}
                                strokeWidth={3}
                                dot={{ r: 4 }}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            );
        }

        // Bar chart
        return (
            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart {...commonProps}>
                    {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
                    <XAxis
                        dataKey="period"
                        fontSize={12}
                        tick={{ fill: '#6B7280' }}
                    />
                    <YAxis
                        fontSize={12}
                        tick={{ fill: '#6B7280' }}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {showLegend && <Legend />}

                    {Array.isArray(chartConfig) ? (
                        chartConfig.map((config, index) => (
                            <Bar
                                key={index}
                                {...config}
                                fillOpacity={0.8}
                            />
                        ))
                    ) : (
                        <Bar
                            {...chartConfig}
                            fillOpacity={0.8}
                        />
                    )}
                </ComposedChart>
            </ResponsiveContainer>
        );
    };

    return (
        <motion.div
            className="space-y-6"
            variants={fadeIn}
            initial="hidden"
            animate="show"
        >
            {/* Insights Cards */}
            {insights && !loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        title="Total Revenue"
                        value={`₹${(insights.totalRevenue / 1000).toFixed(0)}K`}
                        change={insights.growthRate}
                        icon={TrendingUp}
                        color="blue"
                    />
                    <MetricCard
                        title="Total Invoices"
                        value={(insights.totalInvoices || 0).toLocaleString()}
                        icon={BarChart3}
                        color="green"
                    />
                    <MetricCard
                        title="Avg Invoice Value"
                        value={`₹${Math.round(insights.avgInvoiceValue || 0).toLocaleString()}`}
                        icon={Target}
                        color="amber"
                    />
                    <MetricCard
                        title="Periods Tracked"
                        value={insights.periodsWithData}
                        icon={Calendar}
                        color="blue"
                    />
                </div>
            )}

            {/* Main Chart Card */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                                Revenue Over Time Analysis
                                {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                            </CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                                Real-time revenue trends and performance metrics
                            </p>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="flex items-center space-x-1">
                                <Activity className="w-3 h-3" />
                                <span>Live Data</span>
                            </Badge>
                            {insights && (
                                <Badge variant="secondary">
                                    {insights.periodsWithData} periods
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Controls */}
                    <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <TabsList className="grid grid-cols-3 w-full lg:w-auto">
                                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                                <TabsTrigger value="both">Combined</TabsTrigger>
                            </TabsList>

                            <div className="flex flex-wrap items-center gap-2">
                                {/* Time Range */}
                                <Select value={timeRange} onValueChange={setTimeRange}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="quarterly">Quarterly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Chart Type */}
                                <Select value={chartType} onValueChange={setChartType}>
                                    <SelectTrigger className="w-28">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="area">Area</SelectItem>
                                        <SelectItem value="line">Line</SelectItem>
                                        <SelectItem value="bar">Bar</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Toggles */}
                                <div className="flex items-center space-x-1">
                                    <Switch
                                        checked={showPaidOnly}
                                        onCheckedChange={setShowPaidOnly}
                                        id="paid-only"
                                    />
                                    <label htmlFor="paid-only" className="text-xs">Paid Only</label>
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowGrid(!showGrid)}
                                >
                                    {showGrid ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExport}
                                    disabled={!chartData || chartData.length === 0}
                                >
                                    <Download className="w-4 h-4" />
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={refetch}
                                    disabled={loading}
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>
                    </Tabs>
                </CardHeader>

                <CardContent>
                    {renderChart()}
                </CardContent>
            </Card>

            {/* Insights Panel */}
            {insights && !loading && (
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                            <Zap className="w-5 h-5 text-amber-500 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Revenue Insights</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        • Peak revenue period: {insights.peakPeriod} (₹{(insights.maxRevenue / 1000).toFixed(0)}K)
                                    </div>
                                    <div>
                                        • Growth trend: {insights.growthRate > 0 ? 'Positive' : insights.growthRate < 0 ? 'Negative' : 'Stable'} ({insights.growthRate.toFixed(1)}%)
                                    </div>
                                    <div>
                                        • Average per invoice: ₹{Math.round(insights.avgInvoiceValue || 0).toLocaleString()}
                                    </div>
                                    <div>
                                        • Data coverage: {insights.periodsWithData} {timeRange} periods
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </motion.div>
    );
} 