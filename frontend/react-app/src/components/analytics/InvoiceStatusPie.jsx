import React, { useState, useContext, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Clock, AlertTriangle, CheckCircle, TrendingDown, TrendingUp, Eye, Filter, Calendar, DollarSign, Loader, RefreshCw, FileX, Plus } from "lucide-react";
import { useInvoiceStatusDistribution } from "../../hooks/useAnalytics";
import AnalyticsContext from "../../contexts/AnalyticsContext";

// This will be replaced with real data from the hook

const COLORS = {
    "Paid": "#22c55e",
    "Pending": "#3b82f6",
    "Overdue": "#ef4444",
    "Draft": "#6b7280",
    "Cancelled": "#6b7280"
};

const RISK_COLORS = {
    "Low": "text-emerald-600 bg-emerald-50",
    "Medium": "text-amber-600 bg-amber-50",
    "High": "text-red-600 bg-red-50",
    "None": "text-gray-600 bg-gray-50"
};

// Aging data will come from the hook

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-[200px]">
                <h4 className="font-semibold text-gray-900 mb-2">{data.name} Invoices</h4>
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Count:</span>
                        <span className="font-semibold">{data.value}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-semibold">₹{(data.amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Avg Days:</span>
                        <span className="font-semibold">{data.avgDays} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Risk Level:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${RISK_COLORS[data.risk]}`}>
                            {data.risk}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const StatusCard = ({ status, isSelected, onClick, totalCount }) => {
    // Ensure all values are valid numbers
    const value = status?.value || 0;
    const amount = status?.amount || 0;
    const trend = status?.trend || 0;
    const avgDays = status?.avgDays || 0;
    const name = status?.name || 'Unknown';
    const risk = status?.risk || 'None';

    const percentage = totalCount > 0 ? ((value / totalCount) * 100).toFixed(1) : '0';
    const Icon = name === 'Paid' ? CheckCircle :
        name === 'Overdue' ? AlertTriangle :
            name === 'Draft' ? Eye : Clock;

    return (
        <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${isSelected
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
            onClick={() => onClick(status)}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5`} style={{ color: COLORS[name] || '#6b7280' }} />
                    <span className="font-semibold text-gray-900">{name}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${RISK_COLORS[risk] || 'text-gray-600 bg-gray-50'}`}>
                    {risk}
                </span>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-bold text-gray-900">{value}</span>
                    <span className="text-sm text-gray-600">{percentage}%</span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                        {amount > 0 ? `₹${(amount / 1000).toFixed(0)}K` : '₹0'}
                    </span>
                    {trend !== 0 && (
                        <div className="flex items-center gap-1">
                            {trend > 0 ? (
                                <TrendingUp className="w-3 h-3 text-emerald-600" />
                            ) : (
                                <TrendingDown className="w-3 h-3 text-red-600" />
                            )}
                            <span className={`text-xs font-medium ${trend > 0 ? 'text-emerald-600' : 'text-red-600'
                                }`}>
                                {Math.abs(trend).toFixed(1)}%
                            </span>
                        </div>
                    )}
                </div>

                {avgDays > 0 && (
                    <div className="text-xs text-gray-500">
                        Avg: {avgDays} days
                    </div>
                )}
            </div>
        </div>
    );
};

export default function InvoiceStatusPie() {
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [viewMode, setViewMode] = useState('overview'); // overview, aging, trends

    // Use real-time data from analytics hook with defensive context usage
    const analyticsContext = useContext(AnalyticsContext);
    const filters = analyticsContext?.filters || {
        startDate: '',
        endDate: '',
        companyId: '',
        customerId: '',
        status: '',
        period: 'monthly'
    };

    const {
        data,
        loading,
        error,
        chartData,
        agingData,
        summaryMetrics,
        statusData,
        refetch
    } = useInvoiceStatusDistribution(filters);

    // Enhanced data validation and fallbacks
    const statusDataArray = statusData && Array.isArray(statusData) ? statusData : [];
    const agingAnalysisData = agingData && Array.isArray(agingData) ? agingData : [];
    const hasValidData = statusDataArray.length > 0;
    const hasValidAgingData = agingAnalysisData.length > 0;

    // Calculate totals with proper validation
    const totalInvoices = summaryMetrics?.totalInvoices || statusDataArray.reduce((sum, status) => sum + (status.value || 0), 0);
    const totalAmount = summaryMetrics?.totalAmount || statusDataArray.reduce((sum, status) => sum + (status.amount || 0), 0);
    const overduePercentage = summaryMetrics?.overduePercentage || 0;
    const collectionRate = summaryMetrics?.collectionRate || 0;
    const avgDSO = summaryMetrics?.avgDSO || 0;

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, 30000);

        return () => clearInterval(interval);
    }, [refetch]);

    // Loading state
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-3">
                        <Loader className="w-8 h-8 animate-spin text-blue-600" />
                        <p className="text-gray-600">Loading invoice status data...</p>
                        <p className="text-xs text-gray-500">This may take a few moments</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <AlertTriangle className="w-12 h-12 text-red-500" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Unable to Load Data</h3>
                            <p className="text-red-600 mb-3">{error}</p>
                            <p className="text-sm text-gray-500 mb-4">
                                Please check your connection and try again
                            </p>
                        </div>
                        <button
                            onClick={refetch}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Check if we have no data at all - but still maintain component structure
    const hasNoData = !hasValidData && totalInvoices === 0;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
            {/* Header with data quality indicator */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        Invoice Status Intelligence
                        <div className="flex items-center gap-1 ml-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-600 font-medium">LIVE</span>
                        </div>
                        {totalInvoices > 0 && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {totalInvoices} invoice{totalInvoices !== 1 ? 's' : ''}
                            </span>
                        )}

                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Advanced status tracking with risk assessment and aging analysis • Auto-refreshes every 30s
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={refetch}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>

                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {[
                            { key: 'overview', label: 'Overview' },
                            { key: 'aging', label: 'Aging' },
                            { key: 'trends', label: 'Trends' }
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setViewMode(key)}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === key
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Enhanced Key Metrics with better formatting */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Total Value</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-900">
                        {totalAmount > 0 ? `₹${(totalAmount / 1000).toFixed(0)}K` : '₹0'}
                    </span>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-800">Collection Rate</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-900">
                        {collectionRate > 0 ? `${collectionRate.toFixed(0)}%` : '0%'}
                    </span>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">At Risk</span>
                    </div>
                    <span className="text-2xl font-bold text-red-900">
                        {overduePercentage.toFixed(1)}%
                    </span>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">Avg DSO</span>
                    </div>
                    <span className="text-2xl font-bold text-amber-900">
                        {avgDSO > 0 ? `${avgDSO.toFixed(0)} days` : '0 days'}
                    </span>
                </div>
            </div>

            {/* No Data State - Comprehensive message */}
            {hasNoData && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-8 border-2 border-dashed border-gray-300">
                    <div className="flex flex-col items-center gap-4 text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <FileX className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Invoice Data Available</h3>
                            <p className="text-gray-600 mb-4">
                                {filters && Object.keys(filters).some(key => filters[key] && filters[key] !== '')
                                    ? "No invoices match your current filters. Try adjusting your search criteria to see status analytics."
                                    : "You haven't created any invoices yet. Create your first invoice to see comprehensive status analytics, charts, and insights."
                                }
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={refetch}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </button>
                            {(!filters || !Object.keys(filters).some(key => filters[key] && filters[key] !== '')) && (
                                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    <Plus className="w-4 h-4" />
                                    Create Invoice
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Overview Section - Always visible */}
            {viewMode === 'overview' && !hasNoData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Status Cards */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Status Breakdown</h4>
                        {hasValidData ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {statusDataArray.map((status) => (
                                    <StatusCard
                                        key={status.name}
                                        status={status}
                                        isSelected={selectedStatus?.name === status.name}
                                        onClick={setSelectedStatus}
                                        totalCount={totalInvoices}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <div className="text-center">
                                    <FileX className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-600 text-sm">No status data available</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pie Chart */}
                    <div className="flex flex-col">
                        <h4 className="font-semibold text-gray-900 mb-4">Distribution Visualization</h4>
                        {hasValidData ? (
                            <div className="flex-1 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={statusDataArray}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={120}
                                            paddingAngle={2}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {statusDataArray.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[entry.name]}
                                                    stroke={selectedStatus?.name === entry.name ? "#1f2937" : "none"}
                                                    strokeWidth={selectedStatus?.name === entry.name ? 2 : 0}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <div className="text-center">
                                    <FileX className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <h4 className="text-lg font-medium text-gray-900 mb-1">No Chart Data</h4>
                                    <p className="text-gray-600">Chart will appear when invoice data is available</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Aging Analysis Section - Always show structure */}
            {viewMode === 'aging' && !hasNoData && (
                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Invoice Aging Analysis</h4>
                    {hasValidAgingData && agingAnalysisData.length > 0 ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={agingAnalysisData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="range" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="paid" stackId="a" fill="#22c55e" name="Paid" />
                                    <Bar dataKey="pending" stackId="a" fill="#3b82f6" name="Pending" />
                                    <Bar dataKey="overdue" stackId="a" fill="#ef4444" name="Overdue" />
                                    <Bar dataKey="cancelled" stackId="a" fill="#6b7280" name="Cancelled" />
                                    <Bar dataKey="draft" stackId="a" fill="#6b7280" name="Draft" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <div className="text-center">
                                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <h4 className="text-lg font-medium text-gray-900 mb-1">No Aging Data Available</h4>
                                <p className="text-gray-600">Aging analysis will appear when invoice data is available</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {viewMode === 'trends' && selectedStatus && (
                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">
                        {selectedStatus.name} Invoice Details
                    </h4>
                    {selectedStatus.details ? (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                {Object.entries(selectedStatus.details).map(([key, value]) => (
                                    <div key={key} className="text-center">
                                        <div className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                                        <div className="text-xl font-bold text-gray-900">{value || 0}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-gray-600">No detailed information available for this status</p>
                        </div>
                    )}
                </div>
            )}

            {viewMode === 'trends' && !selectedStatus && (
                <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center">
                        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h4 className="text-lg font-medium text-gray-900 mb-1">Select a Status</h4>
                        <p className="text-gray-600">Click on a status card in the Overview tab to see detailed trends</p>
                    </div>
                </div>
            )}

            {/* Enhanced AI Insights with better data validation */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Status Intelligence</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
                        <span className="text-gray-700">
                            <strong>Collection Efficiency:</strong> {collectionRate > 0 ? `${collectionRate.toFixed(0)}% collection rate` : 'No collection data available'} {collectionRate > 70 ? '- above industry average' : collectionRate > 0 ? '- needs improvement' : ''}.
                        </span>
                    </div>
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                        <span className="text-gray-700">
                            <strong>Risk Alert:</strong> {statusDataArray.find(s => s.name === 'Overdue')?.value || 0} invoices overdue with {summaryMetrics?.totalAmountFormatted ? summaryMetrics.totalAmountFormatted.split('.')[0] : '₹0'} at risk. {overduePercentage > 5 ? 'Immediate follow-up recommended' : 'Risk levels manageable'}.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
} 