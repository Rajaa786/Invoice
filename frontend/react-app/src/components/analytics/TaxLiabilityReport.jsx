import React, { useState, useMemo, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
    LineChart, Line, ComposedChart, Area, PieChart, Pie, Cell
} from "recharts";
import {
    FileText, TrendingUp, TrendingDown, AlertTriangle, Shield,
    Calculator, Zap, Calendar, DollarSign, Target, CheckCircle,
    Clock, ArrowUpRight, ArrowDownRight, BarChart3, RefreshCw,
    Filter, Download, AlertCircle, Info, Activity
} from "lucide-react";
import { useTaxLiabilityReport } from "../../hooks/useAnalytics";
import { useAnalyticsContext } from "../../contexts/AnalyticsContext";

// Color schemes for different tax types and statuses
const TAX_COLORS = {
    cgst: "#3b82f6",      // Blue
    sgst: "#10b981",      // Emerald
    igst: "#f59e0b",      // Amber
    total: "#8b5cf6",     // Purple
    forecast: "#6b7280"   // Gray
};

const FILING_STATUS_COLORS = {
    "Filed": "bg-emerald-100 text-emerald-800 border-emerald-200",
    "Filed Late": "bg-amber-100 text-amber-800 border-amber-200",
    "Pending": "bg-red-100 text-red-800 border-red-200",
    "Draft": "bg-gray-100 text-gray-800 border-gray-200"
};

const IMPACT_COLORS = {
    "High": "text-red-600",
    "Medium": "text-amber-600",
    "Low": "text-emerald-600"
};

const CONFIDENCE_COLORS = {
    "High": "text-emerald-600",
    "Medium": "text-amber-600",
    "Low": "text-red-600"
};

// Enhanced Tax Compliance Card Component
const TaxComplianceCard = ({ complianceData, loading }) => {
    if (loading || !complianceData) {
        return (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 animate-pulse">
                <div className="h-4 bg-blue-200 rounded mb-3"></div>
                <div className="space-y-2">
                    <div className="h-8 bg-blue-200 rounded"></div>
                    <div className="h-6 bg-blue-200 rounded"></div>
                </div>
            </div>
        );
    }

    const { overallScore, complianceRate, riskLevel, filingStatus } = complianceData;

    return (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Compliance Overview</h4>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${riskLevel === 'Low' ? 'bg-emerald-100 text-emerald-700' :
                    riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                    }`}>
                    {riskLevel} Risk
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900">{overallScore}%</div>
                    <div className="text-sm text-blue-700">Overall Score</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900">{complianceRate}%</div>
                    <div className="text-sm text-blue-700">Compliance Rate</div>
                </div>
            </div>

            <div className="space-y-2">
                {filingStatus.slice(0, 5).map((filing, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{filing.monthName}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600">{filing.score}%</span>
                            <div className={`w-2 h-2 rounded-full ${filing.status === 'Filed' ? 'bg-emerald-500' :
                                filing.status === 'Filed Late' ? 'bg-amber-500' : 'bg-red-500'
                                }`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Enhanced Tax Optimization Panel Component
const TaxOptimizationPanel = ({ opportunities, loading }) => {
    if (loading || !opportunities) {
        return (
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200 animate-pulse">
                <div className="h-4 bg-emerald-200 rounded mb-3"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-lg p-3 border border-emerald-200">
                            <div className="h-4 bg-emerald-200 rounded mb-2"></div>
                            <div className="h-3 bg-emerald-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const totalPotential = opportunities.reduce((sum, opp) => sum + (opp.potentialSaving || 0), 0);

    return (
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-5 h-5 text-emerald-600" />
                <h4 className="font-semibold text-gray-900">Tax Optimization</h4>
            </div>

            <div className="text-center mb-4">
                <div className="text-2xl font-bold text-emerald-900">
                    ₹{totalPotential.toLocaleString()}
                </div>
                <div className="text-sm text-emerald-700">Potential Annual Savings</div>
            </div>

            <div className="space-y-3">
                {opportunities.slice(0, 4).map((opp, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-emerald-200">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-gray-900 text-sm">{opp.type}</span>
                            <span className="text-sm font-bold text-emerald-600">
                                ₹{(opp.potentialSaving || 0).toLocaleString()}
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{opp.description}</p>
                        <div className="flex justify-between items-center text-xs">
                            <span className={`font-medium ${IMPACT_COLORS[opp.impact]}`}>
                                {opp.impact} Impact
                            </span>
                            <span className="text-gray-500">{opp.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Forecast Indicator Component
const ForecastIndicator = ({ confidence, isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className="flex items-center gap-1 text-xs">
            <Activity className="w-3 h-3" />
            <span className={`font-medium ${CONFIDENCE_COLORS[confidence]}`}>
                {confidence} Confidence
            </span>
        </div>
    );
};

export default function TaxLiabilityReport() {
    const [viewMode, setViewMode] = useState('overview');
    const [selectedPeriod, setSelectedPeriod] = useState('monthly');
    const [showForecast, setShowForecast] = useState(true);
    const [retryCount, setRetryCount] = useState(0);

    const { filters } = useAnalyticsContext();
    const { data, loading, error, refetch } = useTaxLiabilityReport({
        ...filters,
        period: selectedPeriod
    });

    // Memoized data processing
    const processedData = useMemo(() => {
        if (!data) return null;

        const {
            monthlyData = [],
            forecastData = [],
            quarterlySummary = [],
            optimizationOpportunities = [],
            complianceAnalysis = {},
            summaryMetrics = {},
            industryBenchmarks = {}
        } = data;

        // Combine actual and forecast data for charts
        const combinedData = showForecast ? [...monthlyData, ...forecastData] : monthlyData;

        // Calculate insights
        const totalTaxPaid = monthlyData.reduce((sum, d) => sum + (d.totalTax || 0), 0);
        const avgTaxRate = monthlyData.length > 0 ?
            monthlyData.reduce((sum, d) => sum + (d.avgTaxRate || 0), 0) / monthlyData.length : 0;
        const totalRevenue = monthlyData.reduce((sum, d) => sum + (d.totalInvoiceValue || 0), 0);

        return {
            monthlyData,
            forecastData,
            combinedData,
            quarterlySummary,
            optimizationOpportunities,
            complianceAnalysis,
            summaryMetrics,
            industryBenchmarks,
            insights: {
                totalTaxPaid,
                avgTaxRate,
                totalRevenue,
                effectiveTaxRate: totalRevenue > 0 ? (totalTaxPaid / totalRevenue) * 100 : 0
            }
        };
    }, [data, showForecast]);

    // Handle retry logic
    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        refetch();
    };

    // Check if we have no data at all (matching TopItemsAnalysis pattern)
    const hasNoData = !loading && (!data || !processedData?.monthlyData?.length);

    const {
        combinedData,
        optimizationOpportunities,
        complianceAnalysis,
        summaryMetrics,
        insights
    } = processedData || {};

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
            {/* Header with data quality indicator */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Tax Intelligence Dashboard
                        <div className="flex items-center gap-1 ml-2">
                            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : error ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
                            <span className={`text-xs font-medium ${loading ? 'text-amber-600' : error ? 'text-red-600' : 'text-green-600'}`}>
                                {loading ? 'LOADING' : error ? 'ERROR' : 'LIVE'}
                            </span>
                        </div>
                        {processedData?.monthlyData?.length > 0 && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {processedData.monthlyData.length} month{processedData.monthlyData.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Advanced tax analytics with compliance monitoring, optimization insights, and forecasting • Auto-refreshes every 2 minutes
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
                            { key: 'overview', label: 'Overview', icon: BarChart3 },
                            { key: 'compliance', label: 'Compliance', icon: Shield },
                            { key: 'optimization', label: 'Optimize', icon: Calculator },
                            { key: 'forecast', label: 'Forecast', icon: TrendingUp }
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Total Tax</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-900">
                        ₹{summaryMetrics ? ((summaryMetrics.totalTaxCollected || 0) / 100000).toFixed(1) : '0.0'}L
                    </span>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-800">Avg Rate</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-900">
                        {summaryMetrics ? (summaryMetrics.avgTaxRate || 0).toFixed(1) : '0.0'}%
                    </span>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">Compliance</span>
                    </div>
                    <span className="text-2xl font-bold text-amber-900">
                        {complianceAnalysis ? complianceAnalysis.overallScore || 0 : 0}%
                    </span>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                        <Calculator className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Savings</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-900">
                        ₹{optimizationOpportunities ?
                            ((optimizationOpportunities.reduce((sum, opp) => sum + (opp.potentialSaving || 0), 0) || 0) / 1000).toFixed(0) : '0'}K
                    </span>
                </div>
            </div>



            {/* No Data State */}
            {hasNoData && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-8 border-2 border-dashed border-gray-300">
                    <div className="flex flex-col items-center gap-4 text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <Calculator className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tax Data Available</h3>
                            <p className="text-gray-600 mb-4">
                                Start creating invoices with tax information to see comprehensive tax analytics,
                                compliance monitoring, optimization insights, and forecasting.
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
                            <button
                                onClick={() => window.location.hash = '#/invoice'}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Target className="w-4 h-4" />
                                Create Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            {!hasNoData && viewMode === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Tax Trends Chart */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">Tax Liability Trends</h4>
                            <ForecastIndicator
                                confidence={processedData?.forecastData?.[0]?.confidence || 'Medium'}
                                isVisible={showForecast && processedData?.forecastData?.length > 0}
                            />
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={combinedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                    <defs>
                                        <linearGradient id="taxGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="monthName" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value, name) => [
                                            `₹${(value || 0).toLocaleString()}`,
                                            name === 'totalTax' ? 'Total Tax' :
                                                name === 'totalInvoiceValue' ? 'Revenue' :
                                                    name.replace('total', '').toUpperCase()
                                        ]}
                                        labelFormatter={(label, payload) => {
                                            const dataPoint = payload?.[0]?.payload;
                                            return `${label}${dataPoint?.forecast ? ' (Forecast)' : ''}`;
                                        }}
                                    />
                                    <Legend />

                                    <Bar dataKey="totalCGST" stackId="a" fill={TAX_COLORS.cgst} name="CGST" />
                                    <Bar dataKey="totalSGST" stackId="a" fill={TAX_COLORS.sgst} name="SGST" />
                                    <Bar dataKey="totalIGST" stackId="a" fill={TAX_COLORS.igst} name="IGST" />

                                    {showForecast && (
                                        <Line
                                            type="monotone"
                                            dataKey="totalTax"
                                            stroke={TAX_COLORS.total}
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            name="Tax Trend"
                                            connectNulls={false}
                                            dot={{ fill: TAX_COLORS.total, strokeWidth: 2, r: 4 }}
                                        />
                                    )}
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Tax Breakdown Table */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Monthly Tax Breakdown</h4>
                        <div className="overflow-auto max-h-80">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-gray-50">
                                    <tr>
                                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Month</th>
                                        <th className="text-left py-2 px-3 font-semibold text-gray-700">CGST</th>
                                        <th className="text-left py-2 px-3 font-semibold text-gray-700">SGST</th>
                                        <th className="text-left py-2 px-3 font-semibold text-gray-700">IGST</th>
                                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Total</th>
                                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {combinedData?.map((row, index) => (
                                        <tr
                                            key={index}
                                            className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                                                } ${row.forecast ? 'opacity-60' : ''}`}
                                        >
                                            <td className="py-2 px-3 font-medium">
                                                {row.monthName || row.month}
                                                {row.forecast && <span className="text-xs text-gray-500 ml-1">(F)</span>}
                                            </td>
                                            <td className="py-2 px-3">₹{(row.totalCGST || 0).toLocaleString()}</td>
                                            <td className="py-2 px-3">₹{(row.totalSGST || 0).toLocaleString()}</td>
                                            <td className="py-2 px-3">₹{(row.totalIGST || 0).toLocaleString()}</td>
                                            <td className="py-2 px-3 font-semibold">₹{(row.totalTax || 0).toLocaleString()}</td>
                                            <td className="py-2 px-3">{(row.avgTaxRate || 0).toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {!hasNoData && viewMode === 'compliance' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TaxComplianceCard complianceData={complianceAnalysis} loading={loading} />

                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Filing Timeline</h4>
                        <div className="space-y-3">
                            {complianceAnalysis?.filingStatus?.map((filing, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <div className="font-medium text-gray-900">{filing.monthName} {filing.period?.split('-')[0]}</div>
                                        <div className="text-sm text-gray-600">
                                            Score: {filing.score}%
                                            {filing.issues?.length > 0 && (
                                                <span className="text-red-600 ml-2">
                                                    • {filing.issues.length} issue{filing.issues.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${FILING_STATUS_COLORS[filing.status]
                                            }`}>
                                            {filing.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {complianceAnalysis?.recommendations?.length > 0 && (
                            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                <h5 className="font-semibold text-amber-800 mb-2">Compliance Recommendations</h5>
                                <ul className="space-y-1 text-sm text-amber-700">
                                    {complianceAnalysis.recommendations.map((rec, index) => (
                                        <li key={index}>• {rec.recommendation}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!hasNoData && viewMode === 'optimization' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TaxOptimizationPanel opportunities={optimizationOpportunities} loading={loading} />

                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Tax Rate Analysis</h4>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={processedData?.monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="monthName" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`${value}%`, 'Effective Tax Rate']} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="avgTaxRate"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        name="Tax Rate %"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="taxEfficiency"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        name="Efficiency %"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                            <h5 className="font-semibold text-amber-800 mb-2">Optimization Recommendations</h5>
                            <ul className="space-y-1 text-sm text-amber-700">
                                <li>• Consider quarterly advance tax payments to reduce interest burden</li>
                                <li>• Review input tax credit claims for missed opportunities</li>
                                <li>• Evaluate composition scheme eligibility for tax savings</li>
                                <li>• Optimize HSN code classifications for better rates</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {!hasNoData && viewMode === 'forecast' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">Tax Liability Forecast</h4>
                        <ForecastIndicator
                            confidence={processedData?.forecastData?.[0]?.confidence || 'Medium'}
                            isVisible={processedData?.forecastData?.length > 0}
                        />
                    </div>

                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={combinedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="monthName" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip
                                    formatter={(value, name) => [
                                        name.includes('Revenue') ? `₹${(value || 0).toLocaleString()}` : `₹${(value || 0).toLocaleString()}`,
                                        name
                                    ]}
                                />
                                <Legend />

                                <Bar
                                    yAxisId="left"
                                    dataKey="totalTax"
                                    fill="#3b82f6"
                                    name="Tax Liability"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="totalInvoiceValue"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    name="Revenue Trend"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    {processedData?.forecastData?.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {processedData.forecastData.map((forecast, index) => (
                                <div key={index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-blue-900">{forecast.monthName}</span>
                                        <span className={`text-xs font-medium ${CONFIDENCE_COLORS[forecast.confidence]}`}>
                                            {forecast.confidence}
                                        </span>
                                    </div>
                                    <div className="text-lg font-bold text-blue-900 mb-1">
                                        ₹{(forecast.totalTax || 0).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-blue-700">
                                        Rate: {(forecast.avgTaxRate || 0).toFixed(1)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* AI Tax Intelligence Insights - Always visible */}
            <div className="bg-gradient-to-r from-violet-50 to-violet-100 rounded-lg p-4 border border-violet-200">
                <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-violet-600" />
                    <h4 className="font-semibold text-gray-900">Tax Intelligence Insights</h4>
                </div>
                {!hasNoData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
                            <span className="text-gray-700">
                                <strong>Compliance Score:</strong> {complianceAnalysis?.overallScore || 0}% -
                                {complianceAnalysis?.overallScore >= 95 ? ' Excellent' :
                                    complianceAnalysis?.overallScore >= 85 ? ' Good' :
                                        complianceAnalysis?.overallScore >= 70 ? ' Fair' : ' Needs attention'} track record.
                            </span>
                        </div>
                        <div className="flex items-start gap-2">
                            <Calculator className="w-4 h-4 text-blue-600 mt-0.5" />
                            <span className="text-gray-700">
                                <strong>Savings Opportunity:</strong> ₹{((optimizationOpportunities?.reduce((sum, opp) =>
                                    sum + (opp.potentialSaving || 0), 0) || 0) / 1000).toFixed(0)}K potential annual savings through optimization.
                            </span>
                        </div>
                        <div className="flex items-start gap-2">
                            <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5" />
                            <span className="text-gray-700">
                                <strong>Forecast Alert:</strong> Tax liability trends show {
                                    processedData?.forecastData?.[0]?.confidence === 'High' ? 'stable' :
                                        processedData?.forecastData?.[0]?.confidence === 'Medium' ? 'moderate' : 'variable'
                                } growth patterns for upcoming quarters.
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-600">
                        <p>Tax intelligence insights will appear when you have tax data available.</p>
                    </div>
                )}
            </div>
        </div>
    );
} 