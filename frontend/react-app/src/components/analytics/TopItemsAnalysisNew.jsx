import React, { useState, useEffect, useMemo, useContext } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
    LineChart, Line, ComposedChart, Area, PieChart, Pie, Cell
} from "recharts";
import {
    Package, TrendingUp, TrendingDown, DollarSign, AlertTriangle,
    Target, Zap, Eye, BarChart3, PieChart as PieChartIcon, Activity,
    Filter, RefreshCw, Download, Search, SortAsc, SortDesc,
    Loader, FileX, Plus, AlertCircle, Clock, Users, Star,
    TrendingUp as Growth, ShoppingCart, Warehouse, Calculator
} from "lucide-react";
import { useTopItemsAnalysis, useAnalyticsFilters } from "../../hooks/useAnalytics";
import AnalyticsContext from "../../contexts/AnalyticsContext";

const GROWTH_COLORS = {
    "Very High": "text-emerald-700 bg-emerald-100 border-emerald-200",
    "High": "text-emerald-600 bg-emerald-50 border-emerald-200",
    "Medium": "text-amber-600 bg-amber-50 border-amber-200",
    "Low": "text-red-600 bg-red-50 border-red-200"
};

const RISK_COLORS = {
    "Low": "text-emerald-600 bg-emerald-50 border-emerald-200",
    "Medium": "text-amber-600 bg-amber-50 border-amber-200",
    "High": "text-red-600 bg-red-50 border-red-200"
};

const PERFORMANCE_COLORS = {
    excellent: "text-emerald-700 bg-emerald-100",
    good: "text-emerald-600 bg-emerald-50",
    average: "text-amber-600 bg-amber-50",
    poor: "text-red-600 bg-red-50"
};

// Enhanced Trend Indicator with more visual feedback
const TrendIndicator = ({ value, showLabel = true, size = "sm" }) => {
    if (!value && value !== 0) return null;

    const isPositive = value > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? "text-emerald-600" : "text-red-600";
    const bgClass = isPositive ? "bg-emerald-100" : "bg-red-100";
    const sizeClass = size === "lg" ? "w-4 h-4" : "w-3 h-3";
    const textSize = size === "lg" ? "text-sm" : "text-xs";

    return (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${bgClass}`}>
            <Icon className={`${sizeClass} ${colorClass}`} />
            {showLabel && (
                <span className={`${textSize} font-medium ${colorClass}`}>
                    {Math.abs(value).toFixed(1)}%
                </span>
            )}
        </div>
    );
};

// Performance Score Badge
const PerformanceScoreBadge = ({ score }) => {
    if (!score && score !== 0) return null;

    let category = 'poor';
    if (score >= 80) category = 'excellent';
    else if (score >= 60) category = 'good';
    else if (score >= 40) category = 'average';

    return (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${PERFORMANCE_COLORS[category]}`}>
            <Star className="w-3 h-3" />
            <span className="text-xs font-medium">{score}</span>
        </div>
    );
};

// Enhanced Profitability Matrix Chart
const ProfitabilityMatrix = ({ items, loading }) => {
    const matrixData = useMemo(() => {
        if (!items || items.length === 0) return [];

        return items.map(item => ({
            name: item.itemName || 'Unknown',
            profitMargin: item.profitMargin || 0,
            revenue: item.totalRevenue || 0,
            volume: item.totalQuantity || 0,
            performanceScore: item.performanceScore || 0
        }));
    }, [items]);

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-gray-600">Loading profitability matrix...</p>
                </div>
            </div>
        );
    }

    if (matrixData.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                    <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="text-lg font-medium text-gray-900 mb-1">No Profitability Data</h4>
                    <p className="text-gray-600">Matrix will appear when item sales data is available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={matrixData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="volume"
                        label={{ value: 'Volume Sold', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis
                        label={{ value: 'Profit Margin %', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                        formatter={(value, name) => [
                            name === 'revenue' ? `₹${(value || 0).toLocaleString()}` :
                                name === 'profitMargin' ? `${value}%` : value,
                            name === 'revenue' ? 'Revenue' :
                                name === 'profitMargin' ? 'Profit Margin' :
                                    name === 'performanceScore' ? 'Performance Score' : 'Volume'
                        ]}
                    />
                    <Bar dataKey="profitMargin" fill="#3b82f6" name="Profit Margin %" />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Revenue (₹)"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

// Enhanced Demand Forecast Chart
const DemandForecastChart = ({ items, loading }) => {
    const forecastData = useMemo(() => {
        if (!items || items.length === 0) return [];

        return items.map(item => ({
            name: item.itemName || 'Unknown',
            current: item.totalQuantity || 0,
            forecast: item.forecastDemand || 0,
            trend: item.demandTrend || 0
        }));
    }, [items]);

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-gray-600">Loading demand forecast...</p>
                </div>
            </div>
        );
    }

    if (forecastData.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="text-lg font-medium text-gray-900 mb-1">No Forecast Data</h4>
                    <p className="text-gray-600">Demand forecast will appear when sales history is available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="current" fill="#3b82f6" name="Current Sales" />
                    <Bar dataKey="forecast" fill="#10b981" name="Forecast" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default function TopItemsAnalysis() {
    const [viewMode, setViewMode] = useState("overview");
    const [sortBy, setSortBy] = useState("revenue");
    const [sortOrder, setSortOrder] = useState("desc");
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [filterGrowth, setFilterGrowth] = useState("all");
    const [filterRisk, setFilterRisk] = useState("all");

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

    // Combine filters with local state
    const apiFilters = useMemo(() => ({
        ...filters,
        sortBy,
        sortOrder,
        limit: 50 // Get more items for filtering
    }), [filters, sortBy, sortOrder]);

    // Fetch real-time data
    const { data, loading, error, refetch } = useTopItemsAnalysis(apiFilters);

    // Auto-refresh every 2 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, 120000);

        return () => clearInterval(interval);
    }, [refetch]);

    // Process and filter data
    const { filteredItems, summaryStats } = useMemo(() => {
        if (!data || !data.items) {
            return {
                filteredItems: [],
                summaryStats: {
                    totalRevenue: 0,
                    totalProfit: 0,
                    avgProfitMargin: 0,
                    totalQuantitySold: 0,
                    uniqueItems: 0,
                    highGrowthItems: 0
                }
            };
        }

        let filtered = [...data.items];

        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                (item.itemName || '').toLowerCase().includes(searchLower) ||
                (item.sku || '').toLowerCase().includes(searchLower) ||
                (item.description || '').toLowerCase().includes(searchLower)
            );
        }

        // Apply category filter
        if (filterCategory !== 'all') {
            filtered = filtered.filter(item => item.category === filterCategory);
        }

        // Apply growth filter
        if (filterGrowth !== 'all') {
            filtered = filtered.filter(item => item.growthPotential === filterGrowth);
        }

        // Apply risk filter
        if (filterRisk !== 'all') {
            filtered = filtered.filter(item => item.riskLevel === filterRisk);
        }

        return {
            filteredItems: filtered,
            summaryStats: data.summary || {
                totalRevenue: 0,
                totalProfit: 0,
                avgProfitMargin: 0,
                totalQuantitySold: 0,
                uniqueItems: 0,
                highGrowthItems: 0
            }
        };
    }, [data, searchTerm, filterCategory, filterGrowth, filterRisk]);

    // Get unique categories for filter dropdown
    const categories = useMemo(() => {
        if (!data?.items) return [];
        const cats = [...new Set(data.items.map(item => item.category).filter(Boolean))];
        return cats;
    }, [data]);

    // Loading state
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-3">
                        <Loader className="w-8 h-8 animate-spin text-blue-600" />
                        <p className="text-gray-600">Loading product analytics...</p>
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Unable to Load Product Data</h3>
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

    // Check if we have no data at all
    const hasNoData = !filteredItems || filteredItems.length === 0;
    const hasNoBaseData = !data?.items || data.items.length === 0;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
            {/* Header with data quality indicator */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        Product Intelligence Dashboard
                        <div className="flex items-center gap-1 ml-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-600 font-medium">LIVE</span>
                        </div>
                        {filteredItems.length > 0 && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {filteredItems.length} product{filteredItems.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Advanced product analytics with profitability, demand forecasting, and market insights • Auto-refreshes every 2 minutes
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
                            { key: 'profitability', label: 'Profitability', icon: DollarSign },
                            { key: 'forecast', label: 'Forecast', icon: Activity },
                            { key: 'matrix', label: 'Matrix', icon: Target }
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
                        <span className="text-sm font-medium text-blue-800">Total Revenue</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-900">
                        ₹{((summaryStats.totalRevenue || 0) / 100000).toFixed(1)}L
                    </span>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-800">Avg Margin</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-900">
                        {(summaryStats.avgProfitMargin || 0).toFixed(1)}%
                    </span>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                        <Growth className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">High Growth</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-900">{summaryStats.highGrowthItems || 0}</span>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">Total Profit</span>
                    </div>
                    <span className="text-2xl font-bold text-amber-900">
                        ₹{((summaryStats.totalProfit || 0) / 100000).toFixed(1)}L
                    </span>
                </div>
            </div>

            {/* Search and Filter Controls - Always visible */}
            <div className="space-y-4">
                {/* Search Bar */}
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search products by name, SKU, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex gap-2">
                        {/* Category Filter */}
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        {/* Growth Filter */}
                        <select
                            value={filterGrowth}
                            onChange={(e) => setFilterGrowth(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Growth</option>
                            <option value="Very High">Very High</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>

                        {/* Risk Filter */}
                        <select
                            value={filterRisk}
                            onChange={(e) => setFilterRisk(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Risk Levels</option>
                            <option value="Low">Low Risk</option>
                            <option value="Medium">Medium Risk</option>
                            <option value="High">High Risk</option>
                        </select>
                    </div>
                </div>

                {/* Sort Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-700">Sort by:</span>
                    {[
                        { key: 'revenue', label: 'Revenue' },
                        { key: 'profit', label: 'Profit' },
                        { key: 'profitMargin', label: 'Margin' },
                        { key: 'quantity', label: 'Quantity' },
                        { key: 'name', label: 'Name' },
                        { key: 'lastSold', label: 'Last Sold' }
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => {
                                if (sortBy === key) {
                                    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                                } else {
                                    setSortBy(key);
                                    setSortOrder('desc');
                                }
                            }}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${sortBy === key
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {label}
                            {sortBy === key && (
                                sortOrder === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* No Data State - Comprehensive message */}
            {hasNoBaseData && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-8 border-2 border-dashed border-gray-300">
                    <div className="flex flex-col items-center gap-4 text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Product Data Available</h3>
                            <p className="text-gray-600 mb-4">
                                You haven't sold any products yet. Create your first invoice with products to see comprehensive analytics, profitability insights, and demand forecasting.
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
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <Plus className="w-4 h-4" />
                                Create Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filtered No Data State */}
            {!hasNoBaseData && hasNoData && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <Filter className="w-12 h-12 text-blue-500" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Products Match Your Filters</h3>
                            <p className="text-gray-600 mb-3">
                                Try adjusting your search criteria or clearing some filters to see more products.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterCategory('all');
                                setFilterGrowth('all');
                                setFilterRisk('all');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content - Only show if we have data */}
            {!hasNoData && (
                <>
                    {/* Overview Section */}
                    {viewMode === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Revenue Chart */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900">Revenue & Volume Analysis</h4>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={filteredItems.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="itemName" />
                                            <YAxis yAxisId="left" />
                                            <YAxis yAxisId="right" orientation="right" />
                                            <Tooltip formatter={(value, name) => [
                                                name === 'totalRevenue' ? `₹${(value || 0).toLocaleString()}` : value,
                                                name === 'totalRevenue' ? 'Revenue' : 'Quantity'
                                            ]} />
                                            <Legend />
                                            <Bar yAxisId="left" dataKey="totalRevenue" fill="#3b82f6" name="Revenue (₹)" />
                                            <Line yAxisId="right" type="monotone" dataKey="totalQuantity" stroke="#10b981" strokeWidth={2} name="Quantity Sold" />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Product Table */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900">Product Performance</h4>
                                <div className="overflow-auto max-h-64">
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 bg-gray-50">
                                            <tr>
                                                <th className="text-left py-2 px-3 font-semibold text-gray-700">Product</th>
                                                <th className="text-left py-2 px-3 font-semibold text-gray-700">Revenue</th>
                                                <th className="text-left py-2 px-3 font-semibold text-gray-700">Margin</th>
                                                <th className="text-left py-2 px-3 font-semibold text-gray-700">Score</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredItems.slice(0, 10).map((item, index) => (
                                                <tr
                                                    key={item.itemId}
                                                    className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                                                        }`}
                                                    onClick={() => setSelectedItem(item)}
                                                >
                                                    <td className="py-2 px-3">
                                                        <div>
                                                            <div className="font-medium text-gray-900">{item.itemName || 'Unknown'}</div>
                                                            <div className="text-xs text-gray-500">{item.sku || 'N/A'}</div>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <div>
                                                            <div className="font-medium">₹{((item.totalRevenue || 0) / 1000).toFixed(0)}K</div>
                                                            <div className="text-xs text-gray-500">{item.totalQuantity || 0} units</div>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${(item.profitMargin || 0) >= 35 ? 'bg-emerald-100 text-emerald-800' :
                                                            (item.profitMargin || 0) >= 25 ? 'bg-amber-100 text-amber-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                            {(item.profitMargin || 0).toFixed(1)}%
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <PerformanceScoreBadge score={item.performanceScore} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Profitability Section */}
                    {viewMode === 'profitability' && (
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">Profitability Analysis</h4>
                            <ProfitabilityMatrix items={filteredItems} loading={loading} />
                        </div>
                    )}

                    {/* Forecast Section */}
                    {viewMode === 'forecast' && (
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">Demand Forecast</h4>
                            <DemandForecastChart items={filteredItems} loading={loading} />
                        </div>
                    )}

                    {/* Matrix Section */}
                    {viewMode === 'matrix' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900">Growth Potential Matrix</h4>
                                <div className="grid grid-cols-2 gap-4 max-h-80 overflow-y-auto">
                                    {filteredItems.map(item => (
                                        <div key={item.itemId} className="p-4 border border-gray-200 rounded-lg">
                                            <div className="font-medium text-gray-900 mb-2">{item.itemName || 'Unknown'}</div>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Market Share:</span>
                                                    <span className="font-medium">{(item.marketShare || 0).toFixed(1)}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Rating:</span>
                                                    <span className="font-medium">{(item.customerRating || 0).toFixed(1)}/5</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span>Growth:</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${GROWTH_COLORS[item.growthPotential] || GROWTH_COLORS.Low}`}>
                                                        {item.growthPotential || 'Low'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900">Inventory Insights</h4>
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {filteredItems.map(item => (
                                        <div key={item.itemId} className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-medium text-gray-900">{item.itemName || 'Unknown'}</span>
                                                {item.stockAnalysis?.needsReorder && (
                                                    <AlertTriangle className="w-4 h-4 text-red-600" />
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>Stock: {item.stockAnalysis?.currentStock || 0}</div>
                                                <div>Reorder: {item.stockAnalysis?.reorderPoint || 0}</div>
                                                <div>Turnover: {(item.inventoryTurnover || 0).toFixed(1)}x</div>
                                                <div>Lead Time: {item.stockAnalysis?.leadTime || 0}d</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* AI Insights - Always visible */}
            <div className="bg-gradient-to-r from-violet-50 to-violet-100 rounded-lg p-4 border border-violet-200">
                <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-violet-600" />
                    <h4 className="font-semibold text-gray-900">Product Intelligence Insights</h4>
                </div>
                {!hasNoBaseData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-start gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-600 mt-0.5" />
                            <span className="text-gray-700">
                                <strong>Top Performer:</strong> {filteredItems[0]?.itemName || 'No data'} leading with {(filteredItems[0]?.profitMargin || 0).toFixed(1)}% margin and {(filteredItems[0]?.demandTrend || 0).toFixed(1)}% growth.
                            </span>
                        </div>
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                            <span className="text-gray-700">
                                <strong>Inventory Alert:</strong> {filteredItems.filter(item => item.stockAnalysis?.needsReorder).length} product{filteredItems.filter(item => item.stockAnalysis?.needsReorder).length !== 1 ? 's' : ''} below reorder point.
                            </span>
                        </div>
                        <div className="flex items-start gap-2">
                            <Target className="w-4 h-4 text-blue-600 mt-0.5" />
                            <span className="text-gray-700">
                                <strong>Growth Opportunity:</strong> {summaryStats.highGrowthItems || 0} product{(summaryStats.highGrowthItems || 0) !== 1 ? 's' : ''} showing high growth potential.
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-600">
                        <p>Product insights will appear when you have sales data available.</p>
                    </div>
                )}
            </div>
        </div>
    );
} 