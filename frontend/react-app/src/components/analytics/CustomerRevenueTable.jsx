import React, { useState, useMemo, useCallback, useContext, useEffect, memo } from "react";
import { FixedSizeList as List } from 'react-window';
import {
    TrendingUp, TrendingDown, Star, AlertTriangle, Clock, DollarSign,
    Users, Target, Zap, Filter, Download, Search, RefreshCw,
    ChevronUp, ChevronDown, Loader, FileX, ArrowUpDown,
    Eye, MoreHorizontal, Plus, Edit, Phone, Mail
} from "lucide-react";
import { useCustomerRevenueAnalysis } from "../../hooks/useAnalytics";
import AnalyticsContext from "../../contexts/AnalyticsContext";

// Constants for styling and configuration
const SEGMENT_COLORS = {
    "Premium": "bg-emerald-100 text-emerald-800 border-emerald-200",
    "Gold": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Silver": "bg-gray-100 text-gray-800 border-gray-200",
    "Bronze": "bg-orange-100 text-orange-800 border-orange-200",
    "New": "bg-blue-100 text-blue-800 border-blue-200"
};

const RISK_COLORS = {
    "Low": "text-emerald-600 bg-emerald-50",
    "Medium": "text-amber-600 bg-amber-50",
    "High": "text-red-600 bg-red-50"
};

const PAGE_SIZE = 50;
const ROW_HEIGHT = 80;
const TABLE_HEIGHT = 600;
const VIRTUAL_SCROLL_THRESHOLD = 10; // Use virtual scrolling only when more than 10 customers

// Debounced search hook
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// Memoized Customer Score Badge Component
const CustomerScoreBadge = memo(({ score, size = "sm" }) => {
    const getScoreColor = useCallback((score) => {
        if (score >= 90) return "bg-emerald-100 text-emerald-800 border-emerald-200";
        if (score >= 75) return "bg-blue-100 text-blue-800 border-blue-200";
        if (score >= 60) return "bg-amber-100 text-amber-800 border-amber-200";
        return "bg-red-100 text-red-800 border-red-200";
    }, []);

    const sizeClasses = size === "lg" ? "px-3 py-1.5 text-sm" : "px-2 py-1 text-xs";

    return (
        <div className={`${sizeClasses} rounded-full font-medium border flex items-center gap-1 ${getScoreColor(score)}`}>
            <Star className="w-3 h-3" />
            {score}
        </div>
    );
});

// Memoized Trend Indicator Component
const TrendIndicator = memo(({ value, showText = true }) => {
    const isPositive = value > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? "text-emerald-600" : "text-red-600";

    return (
        <div className="flex items-center gap-1">
            <Icon className={`w-3 h-3 ${colorClass}`} />
            {showText && (
                <span className={`text-xs font-medium ${colorClass}`}>
                    {Math.abs(value).toFixed(1)}%
                </span>
            )}
        </div>
    );
});

// Memoized Customer Row Component for Virtual List
const CustomerRow = memo(({ index, style, data }) => {
    const { customers, onCustomerClick } = data;
    const customer = customers[index];

    if (!customer) {
        return (
            <div style={style} className="flex items-center justify-center">
                <Loader className="w-4 h-4 animate-spin text-gray-400" />
            </div>
        );
    }

    const customerName = customer.customerName ||
        `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
        'Unknown Customer';

    return (
        <div
            style={style}
            className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                }`}
            onClick={() => onCustomerClick && onCustomerClick(customer)}
        >
            <div className="flex items-center h-full px-4 py-2">
                {/* Customer Info */}
                <div className="flex-1 min-w-0 pr-4">
                    <div className="font-semibold text-gray-900 truncate">
                        {customerName}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>{customer.invoiceCount || 0} invoices</span>
                        <span>•</span>
                        <span>Last: {customer.lastInvoiceDate ? new Date(customer.lastInvoiceDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                </div>

                {/* Segment */}
                <div className="w-24 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${SEGMENT_COLORS[customer.segment] || SEGMENT_COLORS['Bronze']
                        }`}>
                        {customer.segment || 'Bronze'}
                    </span>
                </div>

                {/* Revenue */}
                <div className="w-32 px-2 text-right">
                    <div className="font-semibold text-gray-900">
                        ₹{((customer.totalRevenue || 0) / 100000).toFixed(1)}L
                    </div>
                    <div className="text-xs text-gray-500">
                        Avg: ₹{((customer.avgInvoiceValue || 0) / 1000).toFixed(0)}K
                    </div>
                </div>

                {/* Payment Stats */}
                <div className="w-28 px-2 text-center">
                    <div className="text-sm font-medium">
                        {customer.paymentRate || 0}%
                    </div>
                    <div className="text-xs text-gray-500">
                        reliability
                    </div>
                </div>

                {/* Risk Level */}
                <div className="w-20 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${RISK_COLORS[customer.riskLevel] || RISK_COLORS['Medium']
                        }`}>
                        {customer.riskLevel || 'Medium'}
                    </span>
                </div>

                {/* Outstanding */}
                <div className="w-28 px-2 text-right">
                    <div className="font-medium">
                        ₹{((customer.pendingAmount + customer.overdueAmount || 0) / 1000).toFixed(0)}K
                    </div>
                    {(customer.pendingAmount + customer.overdueAmount) > 0 && (
                        <div className="text-xs text-red-600">pending</div>
                    )}
                </div>

                {/* Actions */}
                <div className="w-16 px-2 flex justify-center">
                    <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
            </div>
        </div>
    );
});

// Regular Customer Row Component for Small Datasets
const RegularCustomerRow = memo(({ customer, index, onCustomerClick }) => {
    const customerName = customer.customerName ||
        `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
        'Unknown Customer';

    return (
        <div
            className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer h-20 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                }`}
            onClick={() => onCustomerClick && onCustomerClick(customer)}
        >
            <div className="flex items-center h-full px-4 py-2">
                {/* Customer Info */}
                <div className="flex-1 min-w-0 pr-4">
                    <div className="font-semibold text-gray-900 truncate">
                        {customerName}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>{customer.invoiceCount || 0} invoices</span>
                        <span>•</span>
                        <span>Last: {customer.lastInvoiceDate ? new Date(customer.lastInvoiceDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                </div>

                {/* Segment */}
                <div className="w-24 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${SEGMENT_COLORS[customer.segment] || SEGMENT_COLORS['Bronze']
                        }`}>
                        {customer.segment || 'Bronze'}
                    </span>
                </div>

                {/* Revenue */}
                <div className="w-32 px-2 text-right">
                    <div className="font-semibold text-gray-900">
                        ₹{((customer.totalRevenue || 0) / 100000).toFixed(1)}L
                    </div>
                    <div className="text-xs text-gray-500">
                        Avg: ₹{((customer.avgInvoiceValue || 0) / 1000).toFixed(0)}K
                    </div>
                </div>

                {/* Payment Stats */}
                <div className="w-28 px-2 text-center">
                    <div className="text-sm font-medium">
                        {customer.paymentRate || 0}%
                    </div>
                    <div className="text-xs text-gray-500">
                        reliability
                    </div>
                </div>

                {/* Risk Level */}
                <div className="w-20 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${RISK_COLORS[customer.riskLevel] || RISK_COLORS['Medium']
                        }`}>
                        {customer.riskLevel || 'Medium'}
                    </span>
                </div>

                {/* Outstanding */}
                <div className="w-28 px-2 text-right">
                    <div className="font-medium">
                        ₹{((customer.pendingAmount + customer.overdueAmount || 0) / 1000).toFixed(0)}K
                    </div>
                    {(customer.pendingAmount + customer.overdueAmount) > 0 && (
                        <div className="text-xs text-red-600">pending</div>
                    )}
                </div>

                {/* Actions */}
                <div className="w-16 px-2 flex justify-center">
                    <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
            </div>
        </div>
    );
});

// Main Component
export default function CustomerRevenueTable() {
    // Context and hooks
    const analyticsContext = useContext(AnalyticsContext);
    const filters = analyticsContext?.filters || {};

    // Local state
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "totalRevenue", direction: "desc" });
    const [selectedSegment, setSelectedSegment] = useState("all");
    const [selectedRisk, setSelectedRisk] = useState("all");
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Debounced search to reduce API calls
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Build filters for API call
    const apiFilters = useMemo(() => ({
        ...filters,
        searchTerm: debouncedSearchTerm,
        segment: selectedSegment !== "all" ? selectedSegment : undefined,
        riskLevel: selectedRisk !== "all" ? selectedRisk : undefined,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        limit: PAGE_SIZE,
        offset: currentPage * PAGE_SIZE
    }), [filters, debouncedSearchTerm, selectedSegment, selectedRisk, sortConfig, currentPage]);

    // Real-time data fetching
    const {
        data: customers = [],
        loading,
        error,
        refetch
    } = useCustomerRevenueAnalysis(apiFilters);

    // Memoized calculations
    const summaryMetrics = useMemo(() => {
        if (!customers.length) return {
            totalRevenue: 0,
            avgCustomerScore: 0,
            highRiskCustomers: 0,
            totalOutstanding: 0,
            totalCustomers: 0
        };

        return {
            totalRevenue: customers.reduce((sum, c) => sum + (c.totalRevenue || 0), 0),
            avgCustomerScore: customers.reduce((sum, c) => sum + (c.customerScore || 0), 0) / customers.length,
            highRiskCustomers: customers.filter(c => c.riskLevel === "High").length,
            totalOutstanding: customers.reduce((sum, c) => sum + (c.pendingAmount + c.overdueAmount || 0), 0),
            totalCustomers: customers.length
        };
    }, [customers]);

    // Event handlers
    const handleSort = useCallback((key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc"
        }));
        setCurrentPage(0); // Reset to first page when sorting
    }, []);

    const handleCustomerClick = useCallback((customer) => {
        setSelectedCustomer(customer);
        // Could open a modal or navigate to customer details
    }, []);

    const handleExport = useCallback(async () => {
        try {
            // Export all data (not just current page)
            const exportFilters = { ...apiFilters, limit: 10000, offset: 0 };
            const exportData = await window.electron.analytics.getCustomerRevenueAnalysis(exportFilters);

            // Convert to CSV
            const headers = [
                'Customer Name', 'Segment', 'Total Revenue', 'Invoice Count',
                'Avg Invoice Value', 'Payment Rate', 'Risk Level', 'Outstanding Amount'
            ];

            const csvContent = [
                headers.join(','),
                ...exportData.map(customer => [
                    `"${customer.customerName || 'Unknown'}"`,
                    customer.segment || 'Bronze',
                    customer.totalRevenue || 0,
                    customer.invoiceCount || 0,
                    customer.avgInvoiceValue || 0,
                    customer.paymentRate || 0,
                    customer.riskLevel || 'Medium',
                    (customer.pendingAmount + customer.overdueAmount) || 0
                ].join(','))
            ].join('\n');

            // Download file
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `customer-revenue-analysis-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
        }
    }, [apiFilters]);

    // Auto-refresh every 2 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, 120000);

        return () => clearInterval(interval);
    }, [refetch]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(0);
    }, [debouncedSearchTerm, selectedSegment, selectedRisk]);

    // Determine if we should use virtual scrolling and calculate adaptive sizing
    const shouldUseVirtualScrolling = customers.length > VIRTUAL_SCROLL_THRESHOLD;
    const isVerySmallDataset = customers.length <= 3;
    const dynamicTableHeight = shouldUseVirtualScrolling
        ? TABLE_HEIGHT
        : Math.min(customers.length * ROW_HEIGHT + 48, TABLE_HEIGHT); // +48 for header

    // Loading state
    if (loading && customers.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-3">
                        <Loader className="w-8 h-8 animate-spin text-blue-600" />
                        <p className="text-gray-600">Loading customer analytics...</p>
                        <p className="text-xs text-gray-500">Analyzing revenue patterns and customer intelligence</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error && customers.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <AlertTriangle className="w-12 h-12 text-red-500" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Unable to Load Customer Data</h3>
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

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        Customer Revenue Intelligence
                        <div className="flex items-center gap-1 ml-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-600 font-medium">LIVE</span>
                        </div>
                        {summaryMetrics.totalCustomers > 0 && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {summaryMetrics.totalCustomers} customer{summaryMetrics.totalCustomers !== 1 ? 's' : ''}
                            </span>
                        )}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        {isVerySmallDataset
                            ? "Early-stage customer analytics • Optimized for small datasets • Grow your customer base for advanced insights"
                            : "Advanced customer analytics with AI-powered insights, risk assessment, and revenue optimization • Auto-refreshes every 2 minutes"
                        }
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

                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Total Revenue</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-900">
                        ₹{(summaryMetrics.totalRevenue / 100000).toFixed(1)}L
                    </span>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-800">Avg Score</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-900">
                        {summaryMetrics.avgCustomerScore.toFixed(0)}
                    </span>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">High Risk</span>
                    </div>
                    <span className="text-2xl font-bold text-red-900">{summaryMetrics.highRiskCustomers}</span>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">Outstanding</span>
                    </div>
                    <span className="text-2xl font-bold text-amber-900">
                        ₹{(summaryMetrics.totalOutstanding / 100000).toFixed(1)}L
                    </span>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Customers</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-900">{summaryMetrics.totalCustomers}</span>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search customers by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div className="flex gap-2">
                    <select
                        value={selectedSegment}
                        onChange={(e) => setSelectedSegment(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Segments</option>
                        <option value="Premium">Premium</option>
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                        <option value="Bronze">Bronze</option>
                    </select>

                    <select
                        value={selectedRisk}
                        onChange={(e) => setSelectedRisk(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Risk Levels</option>
                        <option value="Low">Low Risk</option>
                        <option value="Medium">Medium Risk</option>
                        <option value="High">High Risk</option>
                    </select>
                </div>
            </div>

            {/* Data Table - Adaptive Rendering */}
            {customers.length === 0 ? (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-8 border-2 border-dashed border-gray-300">
                    <div className="flex flex-col items-center gap-4 text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <FileX className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Customer Data Available</h3>
                            <p className="text-gray-600 mb-4">
                                {searchTerm || selectedSegment !== "all" || selectedRisk !== "all"
                                    ? "No customers match your current filters. Try adjusting your search criteria to see customer analytics."
                                    : "You haven't created any invoices yet. Create your first invoice to see comprehensive customer analytics and insights."
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
                            {!searchTerm && selectedSegment === "all" && selectedRisk === "all" && (
                                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    <Plus className="w-4 h-4" />
                                    Create Invoice
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center h-12 px-4 text-sm font-semibold text-gray-700">
                            <div
                                className="flex-1 cursor-pointer hover:bg-gray-100 px-2 py-2 rounded flex items-center gap-1"
                                onClick={() => handleSort('customerName')}
                            >
                                Customer
                                {sortConfig.key === 'customerName' && (
                                    sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                                )}
                            </div>
                            <div className="w-24 px-2">Segment</div>
                            <div
                                className="w-32 px-2 text-right cursor-pointer hover:bg-gray-100 py-2 rounded flex items-center justify-end gap-1"
                                onClick={() => handleSort('totalRevenue')}
                            >
                                Revenue
                                {sortConfig.key === 'totalRevenue' && (
                                    sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                                )}
                            </div>
                            <div className="w-28 px-2 text-center">Payment</div>
                            <div className="w-20 px-2">Risk</div>
                            <div className="w-28 px-2 text-right">Outstanding</div>
                            <div className="w-16 px-2 text-center">Actions</div>
                        </div>
                    </div>

                    {/* Conditional Table Body Rendering */}
                    {shouldUseVirtualScrolling ? (
                        /* Virtual Scrolling for Large Datasets */
                        <List
                            height={dynamicTableHeight}
                            itemCount={customers.length}
                            itemSize={ROW_HEIGHT}
                            itemData={{ customers, onCustomerClick: handleCustomerClick }}
                        >
                            {CustomerRow}
                        </List>
                    ) : (
                        /* Regular Rendering for Small Datasets */
                        <div style={{ height: dynamicTableHeight, overflowY: 'auto' }}>
                            {customers.map((customer, index) => (
                                <RegularCustomerRow
                                    key={customer.id || `customer-${index}`}
                                    customer={customer}
                                    index={index}
                                    onCustomerClick={handleCustomerClick}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Pagination - Only show for larger datasets */}
            {customers.length > 0 && shouldUseVirtualScrolling && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Showing {currentPage * PAGE_SIZE + 1} to {Math.min((currentPage + 1) * PAGE_SIZE, customers.length)} of {customers.length} customers
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={currentPage === 0}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={customers.length < PAGE_SIZE}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Small Dataset Info */}
            {customers.length > 0 && !shouldUseVirtualScrolling && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Showing all {customers.length} customer{customers.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center gap-2">
                        {isVerySmallDataset && (
                            <div className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                                🌱 Growing Business
                            </div>
                        )}
                        <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                            Optimized for small dataset
                        </div>
                    </div>
                </div>
            )}

            {/* Growth Tips for Very Small Datasets */}
            {isVerySmallDataset && customers.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-sm">💡</span>
                        </div>
                        <h4 className="font-semibold text-gray-900">Growth Tips for Your Business</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start gap-2">
                            <Users className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">
                                <strong>Personal Touch:</strong> With few customers, you can provide exceptional personalized service that larger businesses can't match.
                            </span>
                        </div>
                        <div className="flex items-start gap-2">
                            <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">
                                <strong>Referral Focus:</strong> Ask satisfied customers for referrals - word-of-mouth is powerful for growing businesses.
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Insights - Adaptive based on dataset size */}
            {customers.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5 text-indigo-600" />
                        <h4 className="font-semibold text-gray-900">Customer Intelligence Insights</h4>
                        {isVerySmallDataset && (
                            <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full border border-amber-200">
                                Early Stage
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        {isVerySmallDataset ? (
                            /* Insights for very small datasets */
                            <>
                                <div className="flex items-start gap-2">
                                    <Star className="w-4 h-4 text-blue-600 mt-0.5" />
                                    <span className="text-gray-700">
                                        <strong>Growth Opportunity:</strong> You're in the early stages. Focus on acquiring more customers to unlock deeper analytics.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Target className="w-4 h-4 text-emerald-600 mt-0.5" />
                                    <span className="text-gray-700">
                                        <strong>Customer Focus:</strong> With {customers.length} customer{customers.length !== 1 ? 's' : ''}, maintain personal relationships and ensure excellent service.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5" />
                                    <span className="text-gray-700">
                                        <strong>Next Steps:</strong> Aim for 5-10 customers to unlock advanced segmentation and predictive insights.
                                    </span>
                                </div>
                            </>
                        ) : (
                            /* Regular insights for larger datasets */
                            <>
                                <div className="flex items-start gap-2">
                                    <Star className="w-4 h-4 text-emerald-600 mt-0.5" />
                                    <span className="text-gray-700">
                                        <strong>Revenue Concentration:</strong> Top 20% of customers driving {
                                            customers.length > 0 ?
                                                Math.round((customers.slice(0, Math.ceil(customers.length * 0.2))
                                                    .reduce((sum, c) => sum + (c.totalRevenue || 0), 0) / summaryMetrics.totalRevenue) * 100) : 0
                                        }% of total revenue.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                                    <span className="text-gray-700">
                                        <strong>Risk Alert:</strong> {summaryMetrics.highRiskCustomers} high-risk customers with ₹{(summaryMetrics.totalOutstanding / 100000).toFixed(1)}L outstanding.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
                                    <span className="text-gray-700">
                                        <strong>Opportunity:</strong> Focus on premium customers for upselling and cross-selling opportunities.
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 