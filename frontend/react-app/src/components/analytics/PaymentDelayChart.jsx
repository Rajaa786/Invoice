import React, { useState, useMemo } from "react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
    BarChart, Bar, ComposedChart, Area, ScatterChart, Scatter, PieChart, Pie, Cell
} from "recharts";
import {
    Clock, TrendingUp, TrendingDown, AlertTriangle, Target,
    Zap, Calendar, DollarSign, Users, CheckCircle, Activity,
    ArrowUpRight, ArrowDownRight, BarChart3, Eye, Timer, RefreshCw
} from "lucide-react";
import { useAnalyticsContext } from "../../contexts/AnalyticsContext";
import { usePaymentDelayAnalysis } from "../../hooks/useAnalytics";

// Enhanced payment delay data
const mockPaymentData = [
    {
        month: "Jan",
        avgDelay: 28,
        target: 30,
        onTime: 75,
        late: 20,
        veryLate: 5,
        totalInvoices: 45,
        avgAmount: 18500,
        customerSatisfaction: 4.2,
        cashFlow: 420000,
        industryAvg: 32
    },
    {
        month: "Feb",
        avgDelay: 32,
        target: 30,
        onTime: 68,
        late: 25,
        veryLate: 7,
        totalInvoices: 52,
        avgAmount: 19200,
        customerSatisfaction: 4.0,
        cashFlow: 380000,
        industryAvg: 33
    },
    {
        month: "Mar",
        avgDelay: 26,
        target: 30,
        onTime: 82,
        late: 15,
        veryLate: 3,
        totalInvoices: 48,
        avgAmount: 20100,
        customerSatisfaction: 4.5,
        cashFlow: 520000,
        industryAvg: 31
    },
    {
        month: "Apr",
        avgDelay: 35,
        target: 30,
        onTime: 65,
        late: 28,
        veryLate: 7,
        totalInvoices: 41,
        avgAmount: 17800,
        customerSatisfaction: 3.8,
        cashFlow: 350000,
        industryAvg: 34
    },
    {
        month: "May",
        avgDelay: 24,
        target: 30,
        onTime: 85,
        late: 12,
        veryLate: 3,
        totalInvoices: 55,
        avgAmount: 21300,
        customerSatisfaction: 4.7,
        cashFlow: 580000,
        industryAvg: 30
    },
    {
        month: "Jun",
        avgDelay: 29,
        target: 30,
        onTime: 78,
        late: 18,
        veryLate: 4,
        totalInvoices: 49,
        avgAmount: 19800,
        customerSatisfaction: 4.3,
        cashFlow: 480000,
        industryAvg: 32
    }
];

// Customer payment behavior analysis
const customerPaymentBehavior = [
    {
        customer: "TechCorp Solutions",
        avgDelay: 18,
        consistency: 95,
        paymentMethod: "Bank Transfer",
        creditTerms: 30,
        invoicesCount: 12,
        totalValue: 240000,
        trend: "Improving",
        riskScore: 15,
        preferredDay: "Monday",
        seasonality: "None"
    },
    {
        customer: "Manufacturing Plus",
        avgDelay: 42,
        consistency: 72,
        paymentMethod: "Check",
        creditTerms: 30,
        invoicesCount: 8,
        totalValue: 160000,
        trend: "Stable",
        riskScore: 35,
        preferredDay: "Friday",
        seasonality: "Month-end"
    },
    {
        customer: "ServiceHub Ltd",
        avgDelay: 68,
        consistency: 45,
        paymentMethod: "Mixed",
        creditTerms: 45,
        invoicesCount: 6,
        totalValue: 90000,
        trend: "Deteriorating",
        riskScore: 65,
        preferredDay: "Variable",
        seasonality: "Quarter-end"
    },
    {
        customer: "Global Enterprises",
        avgDelay: 25,
        consistency: 88,
        paymentMethod: "ACH",
        creditTerms: 30,
        invoicesCount: 15,
        totalValue: 300000,
        trend: "Stable",
        riskScore: 20,
        preferredDay: "Wednesday",
        seasonality: "None"
    }
];

// Payment optimization opportunities
const optimizationOpportunities = [
    {
        type: "Early Payment Discounts",
        potential: "8-12 days reduction",
        impact: "High",
        effort: "Low",
        description: "Offer 2% discount for payments within 10 days",
        expectedSavings: 35000,
        status: "Ready to Implement"
    },
    {
        type: "Automated Reminders",
        potential: "5-7 days reduction",
        impact: "Medium",
        effort: "Low",
        description: "Set up automated payment reminder system",
        expectedSavings: 22000,
        status: "In Progress"
    },
    {
        type: "Digital Payment Methods",
        potential: "10-15 days reduction",
        impact: "High",
        effort: "Medium",
        description: "Encourage ACH/digital payments over checks",
        expectedSavings: 45000,
        status: "Planning"
    },
    {
        type: "Credit Term Optimization",
        potential: "3-5 days reduction",
        impact: "Medium",
        effort: "High",
        description: "Negotiate shorter payment terms with reliable customers",
        expectedSavings: 18000,
        status: "Under Review"
    }
];

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];
const TREND_COLORS = {
    "Improving": "text-emerald-600",
    "Stable": "text-blue-600",
    "Deteriorating": "text-red-600"
};

const PaymentBehaviorCard = ({ customer, isSelected, onClick }) => {
    const delayStatus = customer.avgDelay <= 30 ? "Good" : customer.avgDelay <= 45 ? "Fair" : "Poor";
    const statusColor = delayStatus === "Good" ? "emerald" : delayStatus === "Fair" ? "amber" : "red";

    return (
        <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${isSelected
                ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
            onClick={() => onClick(customer)}
        >
            <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border bg-${statusColor}-100 text-${statusColor}-800 border-${statusColor}-200`}>
                    {delayStatus} Payer
                </span>
                <span className={`text-xs font-medium ${TREND_COLORS[customer.trend]}`}>
                    {customer.trend}
                </span>
            </div>

            <h4 className="font-semibold text-gray-900 mb-2">{customer.customer}</h4>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">{customer.avgDelay} days</span>
                    <span className="text-sm text-gray-600">{customer.consistency}% consistent</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>Method: {customer.paymentMethod}</div>
                    <div>Terms: {customer.creditTerms} days</div>
                    <div>Invoices: {customer.invoicesCount}</div>
                    <div>Value: ₹{(customer.totalValue / 1000).toFixed(0)}K</div>
                </div>

                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Risk Score: {customer.riskScore}</span>
                    <div className={`w-2 h-2 rounded-full ${customer.riskScore < 30 ? 'bg-emerald-500' :
                        customer.riskScore < 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                </div>
            </div>
        </div>
    );
};

const PaymentTrendChart = ({ data }) => {
    return (
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                        <linearGradient id="delayGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                        formatter={(value, name) => [
                            name === 'avgDelay' || name === 'target' || name === 'industryAvg' ? `${value} days` :
                                name === 'cashFlow' ? `₹${(value / 1000).toFixed(0)}K` :
                                    name === 'customerSatisfaction' ? `${value}/5` : `${value}%`,
                            name === 'avgDelay' ? 'Avg Delay' :
                                name === 'target' ? 'Target' :
                                    name === 'industryAvg' ? 'Industry Avg' :
                                        name === 'onTime' ? 'On-time %' :
                                            name === 'cashFlow' ? 'Cash Flow' :
                                                name === 'customerSatisfaction' ? 'Satisfaction' : name
                        ]}
                    />
                    <Legend />

                    <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="avgDelay"
                        stroke="#ef4444"
                        strokeWidth={3}
                        fill="url(#delayGradient)"
                        name="Avg Delay (days)"
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="target"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Target (days)"
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="industryAvg"
                        stroke="#6b7280"
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        name="Industry Avg (days)"
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="onTime"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="On-time %"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

const PaymentDistributionChart = ({ data }) => {
    const latestData = data[data.length - 1];
    const distributionData = [
        { name: "On-time", value: latestData.onTime, color: "#10b981" },
        { name: "Late (1-15 days)", value: latestData.late, color: "#f59e0b" },
        { name: "Very Late (15+ days)", value: latestData.veryLate, color: "#ef4444" }
    ];

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={distributionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                        {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

const CustomerPaymentMatrix = ({ customers }) => {
    return (
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        type="number"
                        dataKey="avgDelay"
                        name="Avg Payment Delay"
                        domain={[0, 80]}
                    />
                    <YAxis
                        type="number"
                        dataKey="totalValue"
                        name="Total Value"
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value, name) => [
                            name === 'totalValue' ? `₹${(value / 1000).toFixed(0)}K` : `${value} days`,
                            name === 'totalValue' ? 'Total Value' : 'Avg Delay'
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

export default function PaymentDelayChart() {
    const [viewMode, setViewMode] = useState('overview'); // overview, customers, optimization, insights
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Get real-time payment delay data
    const { filters } = useAnalyticsContext();
    const {
        data: paymentData,
        loading,
        error,
        refetch: refreshData,
        processedData,
        monthlyTrends,
        customerBehavior,
        optimizationOpportunities,
        summaryMetrics,
        insights
    } = usePaymentDelayAnalysis(filters);

    // Process real data with fallback to mock data structure
    const finalProcessedData = useMemo(() => {
        if (!paymentData || loading) {
            // Use mock data as fallback during loading
            const latestMockData = mockPaymentData[mockPaymentData.length - 1];
            return {
                monthlyTrends: mockPaymentData,
                customerBehavior: customerPaymentBehavior,
                optimizationOpportunities: optimizationOpportunities,
                summaryMetrics: {
                    avgDelay: latestMockData.avgDelay,
                    onTimePercentage: latestMockData.onTime,
                    totalCustomers: customerPaymentBehavior.length,
                    totalInvoices: mockPaymentData.reduce((sum, month) => sum + month.totalInvoices, 0),
                    cashFlowImpact: mockPaymentData.reduce((sum, month) => sum + month.cashFlow, 0),
                    industryComparison: latestMockData.avgDelay - latestMockData.industryAvg,
                    trendDirection: latestMockData.avgDelay - mockPaymentData[mockPaymentData.length - 2].avgDelay
                },
                insights: [
                    {
                        type: 'positive',
                        icon: 'CheckCircle',
                        title: 'Performance',
                        message: `${latestMockData.avgDelay} days average - performance tracking enabled.`
                    }
                ]
            };
        }

        return {
            monthlyTrends: monthlyTrends || [],
            customerBehavior: customerBehavior || [],
            optimizationOpportunities: optimizationOpportunities || [],
            summaryMetrics: summaryMetrics || {},
            insights: insights || []
        };
    }, [paymentData, loading, monthlyTrends, customerBehavior, optimizationOpportunities, summaryMetrics, insights]);

    // Check if we have no data at all (matching other components pattern)
    const hasNoData = !loading && (!finalProcessedData.monthlyTrends || finalProcessedData.monthlyTrends.length === 0);

    // Calculate insights from processed data
    const {
        avgDelay = 0,
        onTimePercentage = 0,
        totalCustomers = 0,
        totalInvoices = 0,
        cashFlowImpact = 0,
        industryComparison = 0,
        trendDirection = 0
    } = finalProcessedData.summaryMetrics;

    const totalOptimizationPotential = finalProcessedData.optimizationOpportunities.reduce((sum, opp) => sum + (opp.expectedSavings || 0), 0);

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
            {/* Header with data quality indicator */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Timer className="w-5 h-5 text-blue-600" />
                        Payment Intelligence Dashboard
                        <div className="flex items-center gap-1 ml-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-600 font-medium">LIVE</span>
                        </div>
                        {totalCustomers > 0 && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {totalCustomers} customer{totalCustomers !== 1 ? 's' : ''}
                            </span>
                        )}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Advanced payment analytics with customer behavior insights and optimization opportunities • Auto-refreshes every 2 minutes
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={refreshData}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>

                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {[
                            { key: 'overview', label: 'Overview', icon: BarChart3 },
                            { key: 'customers', label: 'Customers', icon: Users },
                            { key: 'optimization', label: 'Optimization', icon: Target },
                            { key: 'insights', label: 'Insights', icon: Activity }
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
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Avg Delay</span>
                    </div>
                    <span className="text-xl font-bold text-blue-900">
                        {avgDelay || 0} days
                    </span>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-800">On-time Rate</span>
                    </div>
                    <span className="text-xl font-bold text-emerald-900">
                        {onTimePercentage || 0}%
                    </span>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Trend</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {trendDirection > 0 ? (
                            <TrendingUp className="w-4 h-4 text-red-600" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-emerald-600" />
                        )}
                        <span className={`text-lg font-bold ${trendDirection > 0 ? 'text-red-900' : 'text-emerald-900'
                            }`}>
                            {Math.abs(trendDirection || 0).toFixed(0)}d
                        </span>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">Cash Flow Impact</span>
                    </div>
                    <span className="text-xl font-bold text-amber-900">
                        ₹{((cashFlowImpact || 0) / 100000).toFixed(1)}L
                    </span>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">High Risk Customers</span>
                    </div>
                    <span className="text-xl font-bold text-red-900">
                        {finalProcessedData.customerBehavior.filter(c => (c.riskScore || 0) > 50).length}
                    </span>
                </div>
            </div>

            {/* No Data State */}
            {hasNoData && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-8 border-2 border-dashed border-gray-300">
                    <div className="flex flex-col items-center gap-4 text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <Timer className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment Data Available</h3>
                            <p className="text-gray-600 mb-4">
                                Start tracking payment delays by adding invoices with due dates and payment information.
                            </p>
                            <div className="text-sm text-gray-500 space-y-1">
                                <p>• Add customer invoices with payment terms</p>
                                <p>• Track payment dates and delays</p>
                                <p>• Monitor cash flow optimization opportunities</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            {!hasNoData && viewMode === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Payment Trend Chart */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Payment Delay Trends</h4>
                        <PaymentTrendChart data={finalProcessedData.monthlyTrends} />
                    </div>

                    {/* Payment Distribution */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Current Payment Distribution</h4>
                        <PaymentDistributionChart data={finalProcessedData.monthlyTrends} />

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-semibold text-gray-900 mb-2">Performance vs Industry</h5>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-lg font-bold text-blue-600">{avgDelay || 0} days</div>
                                    <div className="text-gray-600">Your Average</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-gray-600">
                                        {finalProcessedData.monthlyTrends.length > 0 ?
                                            (finalProcessedData.monthlyTrends[finalProcessedData.monthlyTrends.length - 1].industryAvg || 32) : 32} days
                                    </div>
                                    <div className="text-gray-600">Industry Average</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!hasNoData && viewMode === 'customers' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Customer Payment Matrix */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">Customer Payment Matrix</h4>
                            <CustomerPaymentMatrix customers={finalProcessedData.customerBehavior} />
                        </div>

                        {/* Customer Behavior Cards */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">Customer Payment Behavior</h4>
                            <div className="grid grid-cols-1 gap-3">
                                {finalProcessedData.customerBehavior.map((customer, index) => (
                                    <PaymentBehaviorCard
                                        key={index}
                                        customer={customer}
                                        isSelected={selectedCustomer?.customer === customer.customer}
                                        onClick={setSelectedCustomer}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!hasNoData && viewMode === 'optimization' && (
                <div className="space-y-6">
                    <h4 className="font-semibold text-gray-900">Payment Optimization Opportunities</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {finalProcessedData.optimizationOpportunities.map((opportunity, index) => (
                            <div key={index} className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
                                <div className="flex justify-between items-start mb-3">
                                    <h5 className="font-semibold text-gray-900">{opportunity.type}</h5>
                                    <span className="text-sm font-bold text-emerald-600">
                                        ₹{((opportunity.expectedSavings || 0) / 1000).toFixed(0)}K
                                    </span>
                                </div>

                                <p className="text-sm text-gray-700 mb-3">{opportunity.description}</p>

                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <span className="text-gray-600">Potential Reduction:</span>
                                        <div className="font-medium">{opportunity.potential}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Status:</span>
                                        <div className="font-medium">{opportunity.status}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Impact:</span>
                                        <div className={`font-medium ${opportunity.impact === 'High' ? 'text-red-600' :
                                            opportunity.impact === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                                            }`}>
                                            {opportunity.impact}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Effort:</span>
                                        <div className={`font-medium ${opportunity.effort === 'High' ? 'text-red-600' :
                                            opportunity.effort === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                                            }`}>
                                            {opportunity.effort}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!hasNoData && viewMode === 'insights' && selectedCustomer && (
                <div className="space-y-6">
                    <h4 className="font-semibold text-gray-900">
                        Payment Analysis: {selectedCustomer.customer}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-semibold text-gray-900 mb-3">Payment Patterns</h5>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Avg Delay:</span>
                                    <span className="font-medium">{selectedCustomer.avgDelay} days</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Consistency:</span>
                                    <span className="font-medium">{selectedCustomer.consistency}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Preferred Day:</span>
                                    <span className="font-medium">{selectedCustomer.preferredDay}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Seasonality:</span>
                                    <span className="font-medium">{selectedCustomer.seasonality}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-semibold text-gray-900 mb-3">Financial Details</h5>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Total Value:</span>
                                    <span className="font-medium">₹{((selectedCustomer.totalValue || 0) / 1000).toFixed(0)}K</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Invoice Count:</span>
                                    <span className="font-medium">{selectedCustomer.invoicesCount || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Credit Terms:</span>
                                    <span className="font-medium">{selectedCustomer.creditTerms || 30} days</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Payment Method:</span>
                                    <span className="font-medium">{selectedCustomer.paymentMethod || 'Bank Transfer'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-semibold text-gray-900 mb-3">Risk Assessment</h5>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Risk Score:</span>
                                    <span className={`font-medium ${(selectedCustomer.riskScore || 0) < 30 ? 'text-emerald-600' :
                                        (selectedCustomer.riskScore || 0) < 50 ? 'text-amber-600' : 'text-red-600'
                                        }`}>
                                        {selectedCustomer.riskScore || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Trend:</span>
                                    <span className={`font-medium ${selectedCustomer.trend === 'Improving' ? 'text-emerald-600' :
                                        selectedCustomer.trend === 'Deteriorating' ? 'text-red-600' : 'text-amber-600'
                                        }`}>
                                        {selectedCustomer.trend || 'Stable'}
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <span className="text-gray-600">Recommendations:</span>
                                    <div className="mt-1 space-y-1 text-xs">
                                        {(selectedCustomer.riskScore || 0) < 30 && (
                                            <>
                                                <div>• Consider early payment discounts</div>
                                                <div>• Maintain current credit terms</div>
                                            </>
                                        )}
                                        {(selectedCustomer.riskScore || 0) >= 30 && (selectedCustomer.riskScore || 0) < 50 && (
                                            <>
                                                <div>• Implement automated reminders</div>
                                                <div>• Consider shorter payment terms</div>
                                            </>
                                        )}
                                        {(selectedCustomer.riskScore || 0) >= 50 && (
                                            <>
                                                <div>• Require payment guarantees</div>
                                                <div>• Consider credit limit reduction</div>
                                                <div>• Implement strict follow-up</div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Payment Intelligence Insights - Always visible */}
            <div className="bg-gradient-to-r from-violet-50 to-violet-100 rounded-lg p-4 border border-violet-200">
                <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-violet-600" />
                    <h4 className="font-semibold text-gray-900">AI Payment Intelligence</h4>
                </div>

                {finalProcessedData.insights && finalProcessedData.insights.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        {finalProcessedData.insights.map((insight, index) => {
                            const IconComponent = insight.icon === 'CheckCircle' ? CheckCircle :
                                insight.icon === 'AlertTriangle' ? AlertTriangle :
                                    insight.icon === 'Target' ? Target : CheckCircle;

                            const iconColor = insight.type === 'positive' ? 'text-emerald-600' :
                                insight.type === 'warning' ? 'text-amber-600' :
                                    insight.type === 'opportunity' ? 'text-blue-600' : 'text-gray-600';

                            return (
                                <div key={index} className="flex items-start gap-2">
                                    <IconComponent className={`w-4 h-4 ${iconColor} mt-0.5`} />
                                    <span className="text-gray-700">
                                        <strong>{insight.title}:</strong> {insight.message}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
                            <span className="text-gray-700">
                                <strong>Performance:</strong> Payment tracking system is active and monitoring customer behavior.
                            </span>
                        </div>
                        <div className="flex items-start gap-2">
                            <Target className="w-4 h-4 text-blue-600 mt-0.5" />
                            <span className="text-gray-700">
                                <strong>Opportunity:</strong> Enable payment automation to reduce manual tracking overhead.
                            </span>
                        </div>
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                            <span className="text-gray-700">
                                <strong>Insights:</strong> Add more customer data to unlock advanced payment analytics.
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 