import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useToast } from './use-toast';

/**
 * Debounce hook to prevent excessive API calls
 */
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

/**
 * 🚀 Comprehensive Analytics Hook with Advanced Features
 * 
 * Features:
 * - Real-time data fetching with caching
 * - Error handling and retry logic
 * - Performance optimization with debouncing
 * - Memory leak prevention
 * - Loading states management
 * - Filter-based data fetching
 * - Automatic cache invalidation
 */

// Configuration constants
const CACHE_DURATION = 2 * 60 * 1000; // Reduced to 2 minutes to prevent stale data
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // Base delay for exponential backoff
const REQUEST_TIMEOUT = 10000; // 10 second timeout

// In-memory cache with TTL and request deduplication
class AnalyticsCache {
    constructor() {
        this.cache = new Map();
        this.timers = new Map();
        this.pendingRequests = new Map(); // For request deduplication
    }

    set(key, data, ttl = CACHE_DURATION) {
        // Clear existing timer
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
        }

        // Set data
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });

        // Set expiration timer
        const timer = setTimeout(() => {
            this.cache.delete(key);
            this.timers.delete(key);
        }, ttl);

        this.timers.set(key, timer);
    }

    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const { data, timestamp, ttl } = cached;
        if (Date.now() - timestamp > ttl) {
            this.cache.delete(key);
            this.timers.delete(key);
            return null;
        }

        return data;
    }

    // Check if request is already pending
    isPending(key) {
        return this.pendingRequests.has(key);
    }

    // Add pending request
    setPending(key, promise) {
        this.pendingRequests.set(key, promise);
        // Clean up after request completes
        promise.finally(() => {
            this.pendingRequests.delete(key);
        });
    }

    // Get pending request
    getPending(key) {
        return this.pendingRequests.get(key);
    }

    clear() {
        this.timers.forEach(timer => clearTimeout(timer));
        this.cache.clear();
        this.timers.clear();
        this.pendingRequests.clear();
    }

    invalidate(pattern) {
        const keys = Array.from(this.cache.keys()).filter(key =>
            key.includes(pattern)
        );
        keys.forEach(key => {
            this.cache.delete(key);
            if (this.timers.has(key)) {
                clearTimeout(this.timers.get(key));
                this.timers.delete(key);
            }
        });
    }
}

// Global cache instance
const analyticsCache = new AnalyticsCache();

// Global auto-refresh coordinator
class AutoRefreshCoordinator {
    constructor() {
        this.intervals = new Map();
        this.callbacks = new Map();
        this.isRefreshing = false;
    }

    register(componentId, callback, interval = 30000) {
        // Clear existing interval if any
        this.unregister(componentId);

        this.callbacks.set(componentId, callback);

        // Use a shared interval to synchronize all components
        if (!this.intervals.has(interval)) {
            const intervalId = setInterval(() => {
                this.triggerRefresh(interval);
            }, interval);
            this.intervals.set(interval, intervalId);
        }
    }

    unregister(componentId) {
        this.callbacks.delete(componentId);

        // Clean up intervals if no components are using them
        for (const [interval, intervalId] of this.intervals.entries()) {
            const hasCallbacks = Array.from(this.callbacks.values()).length > 0;
            if (!hasCallbacks) {
                clearInterval(intervalId);
                this.intervals.delete(interval);
            }
        }
    }

    async triggerRefresh(interval) {
        if (this.isRefreshing) {
            console.log('🔄 AutoRefresh: Skipping refresh - already in progress');
            return;
        }

        this.isRefreshing = true;
        console.log('🔄 AutoRefresh: Starting coordinated refresh');

        try {
            const refreshPromises = Array.from(this.callbacks.values()).map(async (callback) => {
                try {
                    await callback();
                } catch (error) {
                    console.warn('🔄 AutoRefresh: Component refresh failed:', error);
                }
            });

            await Promise.all(refreshPromises);
            console.log('🔄 AutoRefresh: Coordinated refresh completed');
        } catch (error) {
            console.error('🔄 AutoRefresh: Global refresh error:', error);
        } finally {
            this.isRefreshing = false;
        }
    }

    cleanup() {
        this.intervals.forEach(intervalId => clearInterval(intervalId));
        this.intervals.clear();
        this.callbacks.clear();
        this.isRefreshing = false;
    }
}

// Global refresh coordinator
const refreshCoordinator = new AutoRefreshCoordinator();

// Cleanup on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        refreshCoordinator.cleanup();
    });
}

/**
 * Custom hook for analytics data management
 */
export function useAnalytics() {
    const { toast } = useToast();
    const [globalLoading, setGlobalLoading] = useState(false);
    const [globalError, setGlobalError] = useState(null);
    const abortControllerRef = useRef(null);

    // Check if we're in an Electron environment
    const isElectronAvailable = useMemo(() => {
        return typeof window !== 'undefined' &&
            window.electron &&
            window.electron.analytics;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Generic API call with retry logic and request deduplication
    const makeApiCall = useCallback(async (apiMethod, filters = {}, retryCount = 0, methodName = null) => {
        // Safety check for apiMethod
        if (!apiMethod || typeof apiMethod !== 'function') {
            throw new Error('API method is not available. Make sure Electron is properly loaded.');
        }

        // Use provided method name or try to determine it
        const finalMethodName = methodName || apiMethod.name || 'unknown';
        console.log(`🔍 API Call Debug - Method: ${finalMethodName}, Has explicit name: ${!!methodName}`);

        const cacheKey = `${finalMethodName}_${JSON.stringify(filters)}`;

        // Check cache first
        const cached = analyticsCache.get(cacheKey);
        if (cached) {
            console.log(`📋 Cache hit for ${finalMethodName}`);
            return cached;
        }

        // Check if request is already pending (deduplication)
        if (analyticsCache.isPending(cacheKey)) {
            console.log(`⏳ Request deduplication for ${finalMethodName}`);
            return await analyticsCache.getPending(cacheKey);
        }

        // Abort previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new abort controller with timeout
        abortControllerRef.current = new AbortController();
        const timeoutId = setTimeout(() => {
            abortControllerRef.current.abort();
        }, REQUEST_TIMEOUT);

        const requestPromise = (async () => {
            try {
                console.log(`🔄 Making API call for ${finalMethodName} with filters:`, filters);
                const result = await apiMethod(filters);

                // Clear timeout since request completed
                clearTimeout(timeoutId);

                // Validate result
                if (result === null || result === undefined) {
                    console.warn(`⚠️ API call for ${finalMethodName} returned null/undefined`);
                    return null;
                }

                // Cache the result
                analyticsCache.set(cacheKey, result);
                console.log(`✅ API call for ${finalMethodName} completed successfully`);

                return result;
            } catch (error) {
                clearTimeout(timeoutId);

                if (error.name === 'AbortError') {
                    throw new Error('Request was cancelled or timed out');
                }

                // Enhanced error logging
                console.error(`❌ API call for ${finalMethodName} failed:`, {
                    error: error.message,
                    retryCount,
                    filters
                });

                // Exponential backoff retry logic
                if (retryCount < RETRY_ATTEMPTS) {
                    const delay = RETRY_DELAY * Math.pow(2, retryCount);
                    console.log(`🔄 Retrying ${finalMethodName} in ${delay}ms (attempt ${retryCount + 1}/${RETRY_ATTEMPTS})`);

                    await new Promise(resolve => setTimeout(resolve, delay));
                    return makeApiCall(apiMethod, filters, retryCount + 1, methodName);
                }

                throw error;
            }
        })();

        // Register pending request for deduplication
        analyticsCache.setPending(cacheKey, requestPromise);

        return requestPromise;
    }, []);

    // Error handler with enhanced logging
    const handleError = useCallback((error, context) => {
        console.error(`❌ Analytics Error [${context}]:`, {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        setGlobalError(error.message || 'An unexpected error occurred');

        // Only show toast for critical errors, not temporary network issues
        if (!error.message?.includes('timeout') && !error.message?.includes('cancelled')) {
            toast({
                title: "Analytics Error",
                description: error.message || 'Failed to fetch analytics data',
                variant: "destructive",
            });
        }
    }, [toast]);

    return {
        globalLoading,
        globalError,
        makeApiCall,
        handleError,
        clearCache: analyticsCache.clear.bind(analyticsCache),
        invalidateCache: analyticsCache.invalidate.bind(analyticsCache),
        isElectronAvailable,
        refreshCoordinator
    };
}

/**
 * Hook for Summary Metrics with coordinated auto-refresh
 */
export function useSummaryMetrics(filters = {}, autoRefresh = false) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { makeApiCall, handleError, refreshCoordinator } = useAnalytics();
    const componentId = useRef(`summary-metrics-${Math.random()}`).current;

    // Serialize filters to avoid dependency issues
    const filtersString = JSON.stringify(filters);

    const fetchData = useCallback(async () => {
        if (loading) {
            console.log('📊 SummaryMetrics: Skipping fetch - already loading');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Check if Electron API is available
            if (!window.electron?.analytics?.getSummaryMetrics) {
                throw new Error('Summary Metrics API is not available. Please ensure Electron is properly loaded.');
            }

            const parsedFilters = JSON.parse(filtersString);
            console.log('📊 SummaryMetrics: Fetching data with filters:', parsedFilters);

            const result = await makeApiCall(
                window.electron.analytics.getSummaryMetrics,
                parsedFilters,
                0, // retryCount
                'getSummaryMetrics' // explicit method name
            );

            if (result) {
                setData(result);
                console.log('📊 SummaryMetrics: Data updated successfully');
            } else {
                console.warn('📊 SummaryMetrics: Received null/undefined result');
                setData(null);
            }
        } catch (err) {
            console.error('📊 SummaryMetrics: Fetch failed:', err);
            setError(err.message);
            handleError(err, 'Summary Metrics');

            // Don't clear data on error - keep showing last known good data
            // setData(null);
        } finally {
            setLoading(false);
        }
    }, [filtersString, makeApiCall, handleError, loading]);

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Register with auto-refresh coordinator
    useEffect(() => {
        if (autoRefresh) {
            console.log('📊 SummaryMetrics: Registering for auto-refresh');
            refreshCoordinator.register(componentId, fetchData);

            return () => {
                console.log('📊 SummaryMetrics: Unregistering from auto-refresh');
                refreshCoordinator.unregister(componentId);
            };
        }
    }, [autoRefresh, fetchData, componentId, refreshCoordinator]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        // Derived metrics
        kpiMetrics: useMemo(() => {
            if (!data) return null;

            // Provide safe defaults for all values
            const totalRevenue = data.totalRevenue || 0;
            const totalInvoices = data.totalInvoices || 0;
            const avgInvoiceValue = data.avgInvoiceValue || 0;
            const paymentRate = data.paymentRate || 0;
            const collectionEfficiency = data.collectionEfficiency || 0;

            return {
                totalRevenue: {
                    value: totalRevenue,
                    formatted: new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR'
                    }).format(totalRevenue)
                },
                totalInvoices: {
                    value: totalInvoices,
                    formatted: totalInvoices.toLocaleString()
                },
                avgInvoiceValue: {
                    value: avgInvoiceValue,
                    formatted: new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR'
                    }).format(avgInvoiceValue)
                },
                paymentRate: {
                    value: paymentRate,
                    formatted: `${paymentRate}%`
                },
                collectionEfficiency: {
                    value: collectionEfficiency,
                    formatted: `${collectionEfficiency}%`
                }
            };
        }, [data])
    };
}

/**
 * Hook for Revenue Over Time
 */
export function useRevenueOverTime(filters = {}) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { makeApiCall, handleError } = useAnalytics();

    // Serialize filters to avoid dependency issues
    const filtersString = JSON.stringify(filters);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Check if Electron API is available
            if (!window.electron?.analytics?.getRevenueOverTime) {
                throw new Error('Revenue Over Time API is not available. Please ensure Electron is properly loaded.');
            }

            const parsedFilters = JSON.parse(filtersString);
            const result = await makeApiCall(
                window.electron.analytics.getRevenueOverTime,
                parsedFilters
            );
            setData(result);
        } catch (err) {
            setError(err.message);
            handleError(err, 'Revenue Over Time');
        } finally {
            setLoading(false);
        }
    }, [filtersString, makeApiCall, handleError]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Chart data formatting
    const chartData = useMemo(() => {
        if (!Array.isArray(data)) return [];

        return data.map(item => {
            // Provide safe defaults for all item properties
            const revenue = item.revenue || 0;
            const invoiceCount = item.invoiceCount || 0;
            const period = item.period || '';

            return {
                ...item,
                revenueFormatted: new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR'
                }).format(revenue),
                period,
                revenue: Number(revenue),
                invoiceCount: Number(invoiceCount)
            };
        });
    }, [data]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        chartData
    };
}

/**
 * Hook for Invoice Status Distribution with Enhanced Analytics and coordinated auto-refresh
 */
export function useInvoiceStatusDistribution(filters = {}, autoRefresh = false) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { makeApiCall, handleError, refreshCoordinator } = useAnalytics();
    const componentId = useRef(`invoice-status-${Math.random()}`).current;

    // Serialize filters to avoid dependency issues
    const filtersString = JSON.stringify(filters);

    const fetchData = useCallback(async () => {
        if (loading) {
            console.log('📈 InvoiceStatus: Skipping fetch - already loading');
            return;
        }

        const parsedFilters = JSON.parse(filtersString);
        console.log('📈 InvoiceStatus: Fetching data with filters:', parsedFilters);
        console.log('📈 InvoiceStatus: About to call makeApiCall...');
        setLoading(true);
        setError(null);

        try {
            // console.log('📈 InvoiceStatus: Calling window.electron.analytics.getInvoiceStatusDistribution directly...');

            // // Debug: Try direct call first
            // const directResult = await window.electron.analytics.getInvoiceStatusDistribution(parsedFilters);
            // console.log('📈 InvoiceStatus: Direct call result:', directResult);

            // Now try through makeApiCall
            console.log('📈 InvoiceStatus: Now trying through makeApiCall...');
            const result = await makeApiCall(
                window.electron.analytics.getInvoiceStatusDistribution,
                parsedFilters,
                0, // retryCount
                'getInvoiceStatusDistribution' // explicit method name
            );
            console.log('📈 InvoiceStatus: makeApiCall result:', result);

            if (result) {
                setData(result);
                console.log('📈 InvoiceStatus: Data updated successfully', {
                    statusCount: result.statusData?.length || 0,
                    totalInvoices: result.summary?.totalInvoices || 0
                });
            } else {
                console.warn('📈 InvoiceStatus: Received null/undefined result');
                setData(null);
            }
        } catch (err) {
            console.error('📈 InvoiceStatus: Fetch failed:', err);
            setError(err.message);
            handleError(err, 'Invoice Status Distribution');

            // Don't clear data on error - keep showing last known good data
            // setData(null);
        } finally {
            setLoading(false);
        }
    }, [filtersString, makeApiCall, handleError, loading]);

    // Clear cache when filters change to prevent stale data
    useEffect(() => {
        const parsed = JSON.parse(filtersString);
        console.log('📈 InvoiceStatus: Filters changed, clearing related cache for filters:', parsed);
        analyticsCache.invalidate('invoice_status');
    }, [filtersString]);

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Register with auto-refresh coordinator
    useEffect(() => {
        if (autoRefresh) {
            console.log('📈 InvoiceStatus: Registering for auto-refresh');
            refreshCoordinator.register(componentId, fetchData);

            return () => {
                console.log('📈 InvoiceStatus: Unregistering from auto-refresh');
                refreshCoordinator.unregister(componentId);
            };
        }
    }, [autoRefresh, fetchData, componentId, refreshCoordinator]);

    // Status colors
    const statusColors = {
        'Paid': '#22c55e',
        'Pending': '#3b82f6',
        'Overdue': '#ef4444',
        'Cancelled': '#6b7280',
        'Draft': '#6b7280'
    };

    // Enhanced chart data
    const chartData = useMemo(() => {
        if (!data?.statusData) return [];

        return data.statusData.map(item => {
            // Provide safe defaults for all item properties
            const value = item.value || 0;
            const amount = item.amount || 0;
            const avgDays = item.avgDays || 0;
            const status = item.status || 'unknown';
            const name = item.name || 'Unknown';

            return {
                ...item,
                value,
                amount,
                avgDays,
                status,
                name,
                color: statusColors[name] || '#6b7280',
                amountFormatted: new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR'
                }).format(amount),
                details: {
                    onTime: status === 'paid' ? Math.floor(value * 0.8) : 0,
                    late: status === 'paid' ? Math.ceil(value * 0.2) : 0,
                    due0to30: status === 'pending' ? Math.floor(value * 0.6) : 0,
                    due31to60: status === 'pending' ? Math.floor(value * 0.3) : 0,
                    due61to90: status === 'pending' ? Math.ceil(value * 0.1) : 0,
                    overdue1to30: status === 'overdue' ? Math.floor(value * 0.6) : 0,
                    overdue31to60: status === 'overdue' ? Math.floor(value * 0.3) : 0,
                    overdue60plus: status === 'overdue' ? Math.ceil(value * 0.1) : 0,
                    pending: status === 'draft' ? Math.floor(value * 0.7) : 0,
                    review: status === 'draft' ? Math.ceil(value * 0.3) : 0,
                    avgPaymentDays: avgDays,
                    efficiency: status === 'paid' ? 95 :
                        status === 'pending' ? 75 :
                            status === 'overdue' ? 35 : 100
                }
            };
        });
    }, [data]);

    // Aging data for chart
    const agingData = useMemo(() => {
        if (!data?.agingData) return [];
        return data.agingData;
    }, [data]);

    // Summary metrics
    const summaryMetrics = useMemo(() => {
        if (!data?.summary) return null;

        // Provide safe defaults for all values
        const totalInvoices = data.summary.totalInvoices || 0;
        const totalAmount = data.summary.totalAmount || 0;
        const collectionRate = data.summary.collectionRate || 0;
        const overduePercentage = data.summary.overduePercentage || 0;
        const avgDSO = data.summary.avgDSO || 0;

        return {
            totalInvoices,
            totalAmount,
            totalAmountFormatted: new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR'
            }).format(totalAmount),
            collectionRate: Math.round(collectionRate),
            overduePercentage: Math.round(overduePercentage * 10) / 10,
            avgDSO: Math.round(avgDSO)
        };
    }, [data]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        chartData,
        agingData,
        summaryMetrics,
        statusData: data?.statusData || []
    };
}

/**
 * Hook for Customer Revenue Analysis
 */
export function useCustomerRevenueAnalysis(filters = {}) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { makeApiCall, handleError } = useAnalytics();

    // Serialize filters to avoid dependency issues
    const filtersString = JSON.stringify(filters);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const parsedFilters = JSON.parse(filtersString);
            const result = await makeApiCall(
                window.electron.analytics.getCustomerRevenueAnalysis,
                parsedFilters
            );
            setData(result);
        } catch (err) {
            setError(err.message);
            handleError(err, 'Customer Revenue Analysis');
        } finally {
            setLoading(false);
        }
    }, [filtersString, makeApiCall, handleError]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Enhanced data with formatting
    const enhancedData = useMemo(() => {
        return data.map(customer => ({
            ...customer,
            totalRevenueFormatted: new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR'
            }).format(customer.totalRevenue),
            avgInvoiceValueFormatted: new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR'
            }).format(customer.avgInvoiceValue),
            paymentRateFormatted: `${customer.paymentRate}%`,
            fullName: `${customer.firstName} ${customer.lastName}`.trim()
        }));
    }, [data]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        enhancedData
    };
}

/**
 * Hook for Company Split Analysis
 */
export function useCompanySplit(filters = {}) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [industryBenchmarks, setIndustryBenchmarks] = useState(null);
    const [summary, setSummary] = useState(null);
    const { makeApiCall, handleError } = useAnalytics();

    // Serialize filters to avoid dependency issues
    const filtersString = JSON.stringify(filters);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const parsedFilters = JSON.parse(filtersString);
            const result = await makeApiCall(
                window.electron.analytics.getCompanySplit,
                parsedFilters,
                0, // retryCount
                'getCompanySplit' // explicit method name
            );

            // Handle the enhanced data structure
            if (result && result.companies) {
                setData(result.companies);
                setIndustryBenchmarks(result.industryBenchmarks);
                setSummary(result.summary);
            } else {
                // Fallback for old data structure
                setData(Array.isArray(result) ? result : []);
                setIndustryBenchmarks(null);
                setSummary(null);
            }
        } catch (err) {
            setError(err.message);
            handleError(err, 'Company Split');
        } finally {
            setLoading(false);
        }
    }, [filtersString, makeApiCall, handleError]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        industryBenchmarks,
        summary,
        // Enhanced data access
        companies: data,
        topPerformers: industryBenchmarks?.topPerformers || [],
        industryLeaders: industryBenchmarks?.industryLeaders || []
    };
}

/**
 * Hook for Top Items Analysis
 */
export function useTopItemsAnalysis(filters = {}) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { makeApiCall, handleError } = useAnalytics();

    // Serialize filters to avoid dependency issues
    const filtersString = JSON.stringify(filters);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const parsedFilters = JSON.parse(filtersString);
            const result = await makeApiCall(
                window.electron.analytics.getTopItemsAnalysis,
                parsedFilters,
                0, // retryCount
                'getTopItemsAnalysis' // explicit method name
            );
            setData(result);
        } catch (err) {
            setError(err.message);
            handleError(err, 'Top Items Analysis');
        } finally {
            setLoading(false);
        }
    }, [filtersString, makeApiCall, handleError]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refetch: fetchData
    };
}

/**
 * Hook for Tax Liability Report
 */
export function useTaxLiabilityReport(filters = {}) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { makeApiCall, handleError } = useAnalytics();

    // Serialize and debounce filters to avoid dependency issues and excessive API calls
    const filtersString = JSON.stringify(filters);
    const debouncedFiltersString = useDebounce(filtersString, 300);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const parsedFilters = JSON.parse(debouncedFiltersString);
            const result = await makeApiCall(
                window.electron.analytics.getTaxLiabilityReport,
                parsedFilters,
                0, // retryCount
                'getTaxLiabilityReport' // explicit method name
            );
            setData(result);
        } catch (err) {
            setError(err.message);
            handleError(err, 'Tax Liability Report');
        } finally {
            setLoading(false);
        }
    }, [debouncedFiltersString, makeApiCall, handleError]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refetch: fetchData
    };
}

/**
 * Hook for Invoice Aging Report
 */
export function useInvoiceAgingReport(filters = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { makeApiCall, handleError, isElectronAvailable } = useAnalytics();

    // Serialize and debounce filters to avoid dependency issues and excessive API calls
    const filtersString = JSON.stringify(filters);
    const debouncedFiltersString = useDebounce(filtersString, 300);

    const fetchData = useCallback(async () => {
        if (!isElectronAvailable) {
            console.warn('Electron API not available for Invoice Aging Report');
            setError('Electron API not available');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const parsedFilters = JSON.parse(debouncedFiltersString);
            console.log('🔍 useInvoiceAgingReport - Fetching data with filters:', parsedFilters);

            const result = await makeApiCall(
                window.electron.analytics.getInvoiceAgingReport,
                parsedFilters,
                0, // retryCount
                'getInvoiceAgingReport' // explicit method name
            );

            console.log('🔍 useInvoiceAgingReport - Received result:', {
                hasResult: !!result,
                resultKeys: result ? Object.keys(result) : null,
                agingBucketsLength: result?.agingBuckets?.length,
                summaryKeys: result?.summary ? Object.keys(result.summary) : null
            });

            setData(result);
        } catch (err) {
            console.error('🔍 useInvoiceAgingReport - Error:', err);
            setError(err.message);
            handleError(err, 'Invoice Aging Report');
        } finally {
            setLoading(false);
        }
    }, [debouncedFiltersString, makeApiCall, handleError, isElectronAvailable]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refetch: fetchData
    };
}

/**
 * Hook for Payment Delay Analysis with Enhanced Dashboard Data
 */
export function usePaymentDelayAnalysis(filters = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { makeApiCall, handleError } = useAnalytics();

    // Serialize filters to avoid dependency issues
    const filtersString = JSON.stringify(filters);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const parsedFilters = JSON.parse(filtersString);
            const result = await makeApiCall(
                window.electron.analytics.getPaymentDelayAnalysis,
                parsedFilters,
                0, // retryCount
                'getPaymentDelayAnalysis' // explicit method name
            );

            console.log('🔍 usePaymentDelayAnalysis - Received result:', {
                result,
                hasResult: !!result,
                resultKeys: result ? Object.keys(result) : null,
                monthlyTrendsLength: result?.monthlyTrends?.length,
                customerBehaviorLength: result?.customerBehavior?.length,
                optimizationOpportunitiesLength: result?.optimizationOpportunities?.length,
                summaryMetricsKeys: result?.summaryMetrics ? Object.keys(result.summaryMetrics) : null
            });

            setData(result);
        } catch (err) {
            setError(err.message);
            handleError(err, 'Payment Delay Analysis');
        } finally {
            setLoading(false);
        }
    }, [filtersString, makeApiCall, handleError]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Enhanced data processing
    const processedData = useMemo(() => {
        if (!data) return null;

        const {
            monthlyTrends = [],
            customerBehavior = [],
            optimizationOpportunities = [],
            summaryMetrics = {},
            insights = []
        } = data;

        return {
            monthlyTrends: monthlyTrends.map(trend => ({
                ...trend,
                // Ensure proper data types and formatting
                avgDelay: Number(trend.avgDelay || 0),
                target: Number(trend.target || 30),
                onTime: Number(trend.onTime || 0),
                late: Number(trend.late || 0),
                veryLate: Number(trend.veryLate || 0),
                totalInvoices: Number(trend.totalInvoices || 0),
                avgAmount: Number(trend.avgAmount || 0),
                customerSatisfaction: Number(trend.customerSatisfaction || 4.0),
                cashFlow: Number(trend.cashFlow || 0),
                industryAvg: Number(trend.industryAvg || 32),
                // Formatted values for display
                avgAmountFormatted: new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR'
                }).format(trend.avgAmount || 0),
                cashFlowFormatted: new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR'
                }).format(trend.cashFlow || 0)
            })),
            customerBehavior: customerBehavior.map(customer => ({
                ...customer,
                // Ensure proper data types
                avgDelay: Number(customer.avgDelay || 0),
                consistency: Number(customer.consistency || 0),
                invoicesCount: Number(customer.invoicesCount || 0),
                totalValue: Number(customer.totalValue || 0),
                riskScore: Number(customer.riskScore || 0),
                onTimePayments: Number(customer.onTimePayments || 0),
                latePayments: Number(customer.latePayments || 0),
                avgInvoiceValue: Number(customer.avgInvoiceValue || 0),
                paymentReliability: Number(customer.paymentReliability || 0),
                // Formatted values
                totalValueFormatted: new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR'
                }).format(customer.totalValue || 0),
                avgInvoiceValueFormatted: new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR'
                }).format(customer.avgInvoiceValue || 0)
            })),
            optimizationOpportunities: optimizationOpportunities.map(opp => ({
                ...opp,
                expectedSavings: Number(opp.expectedSavings || 0),
                expectedSavingsFormatted: new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR'
                }).format(opp.expectedSavings || 0)
            })),
            summaryMetrics: {
                ...summaryMetrics,
                avgDelay: Number(summaryMetrics.avgDelay || 0),
                onTimePercentage: Number(summaryMetrics.onTimePercentage || 0),
                totalCustomers: Number(summaryMetrics.totalCustomers || 0),
                totalInvoices: Number(summaryMetrics.totalInvoices || 0),
                cashFlowImpact: Number(summaryMetrics.cashFlowImpact || 0),
                industryComparison: Number(summaryMetrics.industryComparison || 0),
                improvementPotential: Number(summaryMetrics.improvementPotential || 0),
                trendDirection: Number(summaryMetrics.trendDirection || 0),
                // Formatted values
                cashFlowImpactFormatted: new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR'
                }).format(summaryMetrics.cashFlowImpact || 0)
            },
            insights
        };
    }, [data]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        processedData,
        // Convenience accessors
        monthlyTrends: processedData?.monthlyTrends || [],
        customerBehavior: processedData?.customerBehavior || [],
        optimizationOpportunities: processedData?.optimizationOpportunities || [],
        summaryMetrics: processedData?.summaryMetrics || {},
        insights: processedData?.insights || []
    };
}

/**
 * Hook for Smart Alerts with Real-Time Data
 */
export function useSmartAlerts(filters = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { makeApiCall, handleError } = useAnalytics();

    // Serialize filters to avoid dependency issues
    const filtersString = JSON.stringify(filters);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const parsedFilters = JSON.parse(filtersString);
            const result = await makeApiCall(
                window.electron.analytics.getSmartAlerts,
                parsedFilters,
                0, // retryCount
                'getSmartAlerts' // explicit method name
            );
            setData(result);
        } catch (err) {
            setError(err.message);
            handleError(err, 'Smart Alerts');
        } finally {
            setLoading(false);
        }
    }, [filtersString, makeApiCall, handleError]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Enhanced data processing
    const processedData = useMemo(() => {
        if (!data) return null;

        const { alerts = [], summary = {} } = data;

        return {
            alerts: alerts.map(alert => ({
                ...alert,
                // Ensure proper data types
                confidence: Number(alert.confidence || 0),
                // Format timestamps consistently
                formattedTimestamp: alert.timestamp || 'Unknown',
                // Enhanced categorization
                isUrgent: alert.priority === 'Critical' || alert.priority === 'Urgent',
                isOpportunity: alert.type === 'opportunity',
                isCritical: alert.type === 'critical'
            })),
            summary: {
                ...summary,
                total: Number(summary.total || 0),
                critical: Number(summary.critical || 0),
                warnings: Number(summary.warnings || 0),
                opportunities: Number(summary.opportunities || 0),
                newAlerts: Number(summary.newAlerts || 0),
                avgConfidence: Number(summary.avgConfidence || 0)
            }
        };
    }, [data]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        processedData,
        // Convenience accessors
        alerts: processedData?.alerts || [],
        summary: processedData?.summary || {},
        // Filtered alerts
        criticalAlerts: processedData?.alerts.filter(a => a.type === 'critical') || [],
        warningAlerts: processedData?.alerts.filter(a => a.type === 'warning') || [],
        opportunityAlerts: processedData?.alerts.filter(a => a.type === 'opportunity') || [],
        newAlerts: processedData?.alerts.filter(a => a.status === 'New') || []
    };
}

/**
 * Utility hook for filter management
 */
export function useAnalyticsFilters() {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        companyId: '',
        customerId: '',
        status: '',
        period: 'monthly'
    });

    const updateFilter = useCallback((key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            startDate: '',
            endDate: '',
            companyId: '',
            customerId: '',
            status: '',
            period: 'monthly'
        });
    }, []);

    return {
        filters,
        updateFilter,
        clearFilters,
        setFilters
    };
} 