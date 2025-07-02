import React, { useState, useMemo, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
    LineChart, Line, ComposedChart, Area, PieChart, Pie, Cell, ScatterChart, Scatter
} from "recharts";
import {
    Clock, TrendingUp, TrendingDown, AlertTriangle, Shield,
    Target, Zap, Calendar, DollarSign, Users, CheckCircle,
    ArrowUpRight, ArrowDownRight, BarChart3, Activity, Eye, RefreshCw
} from "lucide-react";
import { useInvoiceAgingReport } from '../../hooks/useAnalytics';

// Enhanced aging data with comprehensive analytics
const mockAgingData = [
    {
        range: "0-30 days",
        amount: 250000,
        invoices: 15,
        customers: 8,
        avgDays: 12,
        collectionRate: 98,
        riskLevel: "Low",
        trend: 5.2,
        priority: "Monitor"
    },
    {
        range: "31-60 days",
        amount: 180000,
        invoices: 12,
        customers: 7,
        avgDays: 45,
        collectionRate: 85,
        riskLevel: "Medium",
        trend: -2.1,
        priority: "Follow-up"
    },
    {
        range: "61-90 days",
        amount: 120000,
        invoices: 8,
        customers: 5,
        avgDays: 75,
        collectionRate: 65,
        riskLevel: "High",
        trend: 8.7,
        priority: "Urgent"
    },
    {
        range: "90+ days",
        amount: 80000,
        invoices: 6,
        customers: 4,
        avgDays: 125,
        collectionRate: 35,
        riskLevel: "Critical",
        trend: 15.3,
        priority: "Critical"
    }
];

// Customer-wise aging analysis
const customerAgingData = [
    {
        customer: "TechCorp Solutions",
        total: 85000,
        current: 65000,
        days30: 20000,
        days60: 0,
        days90: 0,
        paymentHistory: 95,
        riskScore: 15,
        creditLimit: 100000,
        lastPayment: "2024-01-15",
        avgPaymentDays: 18,
        trend: "Improving"
    },
    {
        customer: "Manufacturing Plus",
        total: 120000,
        current: 40000,
        days30: 50000,
        days60: 30000,
        days90: 0,
        paymentHistory: 78,
        riskScore: 35,
        creditLimit: 150000,
        lastPayment: "2024-01-08",
        avgPaymentDays: 42,
        trend: "Stable"
    },
    {
        customer: "ServiceHub Ltd",
        total: 95000,
        current: 25000,
        days30: 30000,
        days60: 25000,
        days90: 15000,
        paymentHistory: 65,
        riskScore: 55,
        creditLimit: 80000,
        lastPayment: "2023-12-20",
        avgPaymentDays: 68,
        trend: "Deteriorating"
    },
    {
        customer: "Global Enterprises",
        total: 200000,
        current: 120000,
        days30: 60000,
        days60: 20000,
        days90: 0,
        paymentHistory: 88,
        riskScore: 25,
        creditLimit: 250000,
        lastPayment: "2024-01-12",
        avgPaymentDays: 28,
        trend: "Stable"
    }
];

// Collection efficiency data
const collectionTrends = [
    { month: "Jul", collected: 420000, outstanding: 180000, efficiency: 70, dso: 35 },
    { month: "Aug", collected: 380000, outstanding: 220000, efficiency: 63, dso: 42 },
    { month: "Sep", collected: 450000, outstanding: 190000, efficiency: 70, dso: 38 },
    { month: "Oct", collected: 520000, outstanding: 160000, efficiency: 76, dso: 32 },
    { month: "Nov", collected: 480000, outstanding: 200000, efficiency: 71, dso: 36 },
    { month: "Dec", collected: 550000, outstanding: 150000, efficiency: 79, dso: 28 }
];

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#dc2626"];
const RISK_COLORS = {
    "Low": "bg-emerald-100 text-emerald-800 border-emerald-200",
    "Medium": "bg-amber-100 text-amber-800 border-amber-200",
    "High": "bg-red-100 text-red-800 border-red-200",
    "Critical": "bg-red-200 text-red-900 border-red-300"
};

const PRIORITY_COLORS = {
    "Monitor": "text-emerald-600",
    "Follow-up": "text-amber-600",
    "Urgent": "text-red-600",
    "Critical": "text-red-800"
};

const TREND_COLORS = {
    "Improving": "text-emerald-600",
    "Stable": "text-blue-600",
    "Deteriorating": "text-red-600"
};

const AgingBucket = ({ bucket, isSelected, onClick, totalAmount }) => {
    const percentage = totalAmount > 0 ? ((bucket.amount / totalAmount) * 100).toFixed(1) : '0.0';

    return (
        <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${isSelected
                ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
            onClick={() => onClick(bucket)}
        >
            <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${RISK_COLORS[bucket.riskLevel]}`}>
                    {bucket.riskLevel} Risk
                </span>
                <span className={`text-xs font-medium ${PRIORITY_COLORS[bucket.priority]}`}>
                    {bucket.priority}
                </span>
            </div>

            <h4 className="font-semibold text-gray-900 mb-2">{bucket.range}</h4>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">₹{(bucket.amount / 100000).toFixed(1)}L</span>
                    <span className="text-sm text-gray-600">{percentage}%</span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{bucket.invoices} invoices</span>
                    <div className="flex items-center gap-1">
                        {bucket.trend > 0 ? (
                            <TrendingUp className="w-3 h-3 text-red-600" />
                        ) : (
                            <TrendingDown className="w-3 h-3 text-emerald-600" />
                        )}
                        <span className={`text-xs font-medium ${bucket.trend > 0 ? 'text-red-600' : 'text-emerald-600'
                            }`}>
                            {Math.abs(bucket.trend).toFixed(1)}%
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>Avg Days: {bucket.avgDays}</div>
                    <div>Collection: {bucket.collectionRate}%</div>
                </div>
            </div>
        </div>
    );
};

const CustomerRiskMatrix = ({ customers }) => {
    return (
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        type="number"
                        dataKey="avgPaymentDays"
                        name="Avg Payment Days"
                        domain={[0, 80]}
                    />
                    <YAxis
                        type="number"
                        dataKey="total"
                        name="Outstanding Amount"
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value, name) => [
                            name === 'total' ? `₹${(value / 1000).toFixed(0)}K` : value,
                            name === 'total' ? 'Outstanding' : 'Avg Payment Days'
                        ]}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.customer}
                    />
                    <Scatter
                        data={customers}
                        fill="#3b82f6"
                        fillOpacity={0.7}
                        stroke="#1d4ed8"
                        strokeWidth={2}
                    />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};

const CollectionEfficiencyChart = ({ data }) => {
    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="collected" fill="#10b981" name="Collected" />
                    <Bar yAxisId="left" dataKey="outstanding" fill="#ef4444" name="Outstanding" />
                    <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#3b82f6" strokeWidth={2} name="Efficiency %" />
                    <Line yAxisId="right" type="monotone" dataKey="dso" stroke="#f59e0b" strokeWidth={2} name="DSO" />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default function InvoiceAgingReport() {
    const [viewMode, setViewMode] = useState('overview'); // overview, customers, trends, insights
    const [selectedBucket, setSelectedBucket] = useState(null);
    const [isResizing, setIsResizing] = useState(false);

    // Get real-time aging data
    const {
        data: agingData,
        loading,
        error,
        refetch: refreshData
    } = useInvoiceAgingReport();

    // Handle window resize to prevent loading state issues
    useEffect(() => {
        let resizeTimer;

        const handleResize = () => {
            setIsResizing(true);
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                setIsResizing(false);
            }, 150);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimer);
        };
    }, []);

    // Add debugging console logs
    console.log('🔍 InvoiceAgingReport Debug:', {
        loading,
        error,
        hasAgingData: !!agingData,
        agingDataKeys: agingData ? Object.keys(agingData) : null,
        agingBucketsLength: agingData?.agingBuckets?.length,
        summaryKeys: agingData?.summary ? Object.keys(agingData.summary) : null,
        summaryValues: agingData?.summary
    });

    // Improved data processing with better fallback logic
    const processedData = useMemo(() => {
        // If still loading, show loading state
        if (loading) {
            return null;
        }

        // If error occurred, show error state
        if (error) {
            console.error('InvoiceAgingReport Error:', error);
            return null;
        }

        // If no data received from backend, show no data state
        if (!agingData) {
            console.warn('No aging data received from backend');
            return null;
        }

        // Check if we received valid data structure
        const hasValidData = agingData.agingBuckets &&
            Array.isArray(agingData.agingBuckets) &&
            agingData.agingBuckets.length > 0;

        if (!hasValidData) {
            console.warn('Received invalid or empty aging data:', agingData);

            // Check if summary has meaningful data
            const summary = agingData.summary || {};
            const hasSummaryData = (summary.totalOutstanding > 0) ||
                (summary.totalInvoices > 0) ||
                (summary.avgDSO > 0);

            if (!hasSummaryData) {
                return null; // Show no data state
            }
        }

        // Process real data
        const result = {
            agingBuckets: agingData.agingBuckets || [],
            customerAging: agingData.customerAging || [],
            collectionTrends: agingData.collectionTrends || [],
            summary: {
                totalOutstanding: Number(agingData.summary?.totalOutstanding || 0),
                totalInvoices: Number(agingData.summary?.totalInvoices || 0),
                avgDSO: Number(agingData.summary?.avgDSO || 0),
                overduePercentage: Number(agingData.summary?.overduePercentage || 0),
                currentEfficiency: Number(agingData.summary?.currentEfficiency || 0),
                totalCustomers: Number(agingData.summary?.totalCustomers || 0),
                highRiskCustomers: Number(agingData.summary?.highRiskCustomers || 0),
                criticalAmount: Number(agingData.summary?.criticalAmount || 0)
            },
            insights: agingData.insights || []
        };

        console.log('🔍 Processed data:', result);
        return result;
    }, [agingData, loading, error]);

    // Determine different states
    const isLoading = loading && !isResizing;
    const hasError = !loading && !isResizing && error;
    const hasNoData = !loading && !isResizing && !error && (!processedData ||
        (!processedData.agingBuckets?.length &&
            processedData.summary?.totalOutstanding === 0 &&
            processedData.summary?.totalInvoices === 0));

    // Calculate insights from processed data with safe defaults
    const {
        totalOutstanding = 0,
        totalInvoices = 0,
        avgDSO = 0,
        overduePercentage = 0,
        currentEfficiency = 0,
        totalCustomers = 0,
        highRiskCustomers = 0
    } = processedData?.summary || {};

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        Receivables Intelligence Dashboard
                        <div className="flex items-center gap-1 ml-2">
                            <div className={`w-2 h-2 rounded-full ${(loading && !isResizing) ? 'bg-amber-500 animate-pulse' : hasError ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
                            <span className={`text-xs font-medium ${(loading && !isResizing) ? 'text-amber-600' : hasError ? 'text-red-600' : 'text-green-600'}`}>
                                {(loading && !isResizing) ? 'LOADING' : hasError ? 'ERROR' : 'LIVE'}
                            </span>
                        </div>
                        {!hasNoData && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-2">
                                {totalInvoices} Invoices
                            </span>
                        )}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Advanced aging analytics with collection insights, risk assessment, and payment predictions • Auto-refreshes every 2 minutes
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={refreshData}
                        disabled={loading && !isResizing}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${(loading && !isResizing) ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>

                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {[
                            { key: 'overview', label: 'Overview', icon: BarChart3 },
                            { key: 'customers', label: 'Customers', icon: Users },
                            { key: 'trends', label: 'Trends', icon: Activity },
                            { key: 'insights', label: 'Insights', icon: Eye }
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

            {/* Key Metrics - Always visible */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Total Outstanding</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-900">
                        ₹{totalOutstanding ? (totalOutstanding / 100000).toFixed(1) : '0.0'}L
                    </span>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">Overdue</span>
                    </div>
                    <span className="text-2xl font-bold text-red-900">
                        {overduePercentage ? overduePercentage.toFixed(1) : '0.0'}%
                    </span>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">Avg DSO</span>
                    </div>
                    <span className="text-2xl font-bold text-amber-900">
                        {avgDSO ? Math.round(avgDSO) : '0'} days
                    </span>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-800">Collection Rate</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-900">
                        {currentEfficiency || '0'}%
                    </span>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">High Risk</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-900">
                        {highRiskCustomers || '0'}
                    </span>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8 border-2 border-dashed border-blue-300">
                    <div className="flex flex-col items-center gap-4 text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Aging Data...</h3>
                            <p className="text-gray-600">
                                Fetching invoice aging analytics and collection insights.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error State */}
            {hasError && (
                <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-8 border-2 border-dashed border-red-300">
                    <div className="flex flex-col items-center gap-4 text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
                            <p className="text-gray-600 mb-4">
                                {error || 'Failed to load invoice aging data. Please try again.'}
                            </p>
                            <button
                                onClick={refreshData}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* No Data State */}
            {hasNoData && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-8 border-2 border-dashed border-gray-300">
                    <div className="flex flex-col items-center gap-4 text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <Clock className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Aging Data Available</h3>
                            <p className="text-gray-600 mb-4">
                                Start creating invoices with due dates to see aging analysis and collection insights.
                            </p>
                            <div className="text-sm text-gray-500">
                                Aging reports will show invoice payment status, customer risk analysis, and collection efficiency metrics.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            {!hasNoData && !isLoading && !hasError && processedData && (
                <>
                    {viewMode === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Aging Buckets */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900">Aging Analysis</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {processedData.agingBuckets.map((bucket, index) => (
                                        <AgingBucket
                                            key={index}
                                            bucket={bucket}
                                            isSelected={selectedBucket?.range === bucket.range}
                                            onClick={setSelectedBucket}
                                            totalAmount={totalOutstanding}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Aging Distribution Chart */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900">Outstanding Distribution</h4>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={processedData.agingBuckets} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="range" />
                                            <YAxis yAxisId="left" />
                                            <YAxis yAxisId="right" orientation="right" />
                                            <Tooltip
                                                formatter={(value, name) => [
                                                    name === 'amount' ? `₹${(value / 1000).toFixed(0)}K` :
                                                        name === 'collectionRate' ? `${value}%` : value,
                                                    name === 'amount' ? 'Outstanding' :
                                                        name === 'collectionRate' ? 'Collection Rate' : 'Invoices'
                                                ]}
                                            />
                                            <Legend />

                                            <Bar yAxisId="left" dataKey="amount" fill="#3b82f6" name="Outstanding (₹K)" />
                                            <Bar yAxisId="left" dataKey="invoices" fill="#10b981" name="Invoices" />
                                            <Line
                                                yAxisId="right"
                                                type="monotone"
                                                dataKey="collectionRate"
                                                stroke="#ef4444"
                                                strokeWidth={3}
                                                name="Collection Rate %"
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {viewMode === 'customers' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Customer Risk Matrix */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900">Customer Risk Matrix</h4>
                                    <CustomerRiskMatrix customers={processedData.customerAging} />
                                </div>

                                {/* Customer Aging Table */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900">Customer Aging Details</h4>
                                    <div className="overflow-auto max-h-80">
                                        <table className="w-full text-sm">
                                            <thead className="sticky top-0 bg-gray-50">
                                                <tr>
                                                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Customer</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Total</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Current</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-gray-700">30+</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-gray-700">60+</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-gray-700">90+</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Risk</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {processedData.customerAging.map((customer, index) => (
                                                    <tr
                                                        key={index}
                                                        className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                                                            }`}
                                                    >
                                                        <td className="py-2 px-3 font-medium">{customer.customer}</td>
                                                        <td className="py-2 px-3 font-semibold">₹{(customer.total / 1000).toFixed(0)}K</td>
                                                        <td className="py-2 px-3">₹{(customer.current / 1000).toFixed(0)}K</td>
                                                        <td className="py-2 px-3">₹{(customer.days30 / 1000).toFixed(0)}K</td>
                                                        <td className="py-2 px-3">₹{(customer.days60 / 1000).toFixed(0)}K</td>
                                                        <td className="py-2 px-3">₹{(customer.days90 / 1000).toFixed(0)}K</td>
                                                        <td className="py-2 px-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-medium">{customer.riskScore}</span>
                                                                <div className={`w-2 h-2 rounded-full ${customer.riskScore < 30 ? 'bg-emerald-500' :
                                                                    customer.riskScore < 50 ? 'bg-amber-500' : 'bg-red-500'
                                                                    }`} />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {viewMode === 'trends' && (
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">Collection Efficiency Trends</h4>
                            <CollectionEfficiencyChart data={processedData.collectionTrends} />
                        </div>
                    )}

                    {viewMode === 'insights' && selectedBucket && (
                        <div className="space-y-6">
                            <h4 className="font-semibold text-gray-900">
                                Detailed Analysis: {selectedBucket.range}
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h5 className="font-semibold text-gray-900 mb-3">Financial Impact</h5>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Outstanding Amount:</span>
                                            <span className="font-medium">₹{(selectedBucket.amount / 100000).toFixed(1)}L</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Number of Invoices:</span>
                                            <span className="font-medium">{selectedBucket.invoices}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Affected Customers:</span>
                                            <span className="font-medium">{selectedBucket.customers}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Average Days:</span>
                                            <span className="font-medium">{selectedBucket.avgDays} days</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h5 className="font-semibold text-gray-900 mb-3">Collection Metrics</h5>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Collection Rate:</span>
                                            <span className="font-medium">{selectedBucket.collectionRate}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Risk Level:</span>
                                            <span className={`font-medium ${selectedBucket.riskLevel === 'Low' ? 'text-emerald-600' :
                                                selectedBucket.riskLevel === 'Medium' ? 'text-amber-600' :
                                                    selectedBucket.riskLevel === 'High' ? 'text-red-600' : 'text-red-800'
                                                }`}>
                                                {selectedBucket.riskLevel}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Priority:</span>
                                            <span className={`font-medium ${PRIORITY_COLORS[selectedBucket.priority]}`}>
                                                {selectedBucket.priority}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Trend:</span>
                                            <span className={`font-medium ${selectedBucket.trend > 0 ? 'text-red-600' : 'text-emerald-600'
                                                }`}>
                                                {selectedBucket.trend > 0 ? '↑' : '↓'} {Math.abs(selectedBucket.trend).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h5 className="font-semibold text-gray-900 mb-3">Recommended Actions</h5>
                                    <div className="space-y-2 text-sm">
                                        {selectedBucket.range === "0-30 days" && (
                                            <>
                                                <div>• Send payment reminders</div>
                                                <div>• Maintain regular follow-up</div>
                                                <div>• Monitor for early warning signs</div>
                                            </>
                                        )}
                                        {selectedBucket.range === "31-60 days" && (
                                            <>
                                                <div>• Escalate to senior staff</div>
                                                <div>• Implement payment plans</div>
                                                <div>• Review credit terms</div>
                                            </>
                                        )}
                                        {selectedBucket.range === "61-90 days" && (
                                            <>
                                                <div>• Legal notice consideration</div>
                                                <div>• Suspend credit privileges</div>
                                                <div>• Negotiate settlement</div>
                                            </>
                                        )}
                                        {selectedBucket.range === "90+ days" && (
                                            <>
                                                <div>• Initiate legal proceedings</div>
                                                <div>• Consider debt collection</div>
                                                <div>• Evaluate write-off options</div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* AI Receivables Intelligence Insights - Always visible */}
            <div className="bg-gradient-to-r from-violet-50 to-violet-100 rounded-lg p-4 border border-violet-200">
                <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-violet-600" />
                    <h4 className="font-semibold text-gray-900">Receivables Intelligence Insights</h4>
                </div>
                {!hasNoData && !isLoading && !hasError && processedData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        {processedData.insights && processedData.insights.length > 0 ? (
                            processedData.insights.map((insight, index) => {
                                const IconComponent = insight.icon === 'CheckCircle' ? CheckCircle :
                                    insight.icon === 'AlertTriangle' ? AlertTriangle :
                                        insight.icon === 'Target' ? Target : Zap;
                                const iconColor = insight.type === 'positive' ? 'text-emerald-600' :
                                    insight.type === 'warning' ? 'text-amber-600' :
                                        insight.type === 'negative' ? 'text-red-600' :
                                            insight.type === 'opportunity' ? 'text-blue-600' : 'text-violet-600';

                                return (
                                    <div key={index} className="flex items-start gap-2">
                                        <IconComponent className={`w-4 h-4 ${iconColor} mt-0.5`} />
                                        <span className="text-gray-700">
                                            <strong>{insight.title}:</strong> {insight.message}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <>
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
                                    <span className="text-gray-700">
                                        <strong>Collection Health:</strong> {currentEfficiency}% efficiency rate - {currentEfficiency >= 75 ? 'above' : 'below'} industry average of 72%.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                                    <span className="text-gray-700">
                                        <strong>Risk Monitoring:</strong> {highRiskCustomers} high-risk customers requiring attention.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Target className="w-4 h-4 text-blue-600 mt-0.5" />
                                    <span className="text-gray-700">
                                        <strong>Cash Flow:</strong> ₹{totalOutstanding ? (totalOutstanding / 100000).toFixed(1) : '0'}L outstanding with {avgDSO ? Math.round(avgDSO) : '0'} days average DSO.
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="text-sm text-gray-600 text-center py-4">
                        Receivables intelligence insights will appear when you have invoice aging data available.
                    </div>
                )}
            </div>
        </div>
    );
} 