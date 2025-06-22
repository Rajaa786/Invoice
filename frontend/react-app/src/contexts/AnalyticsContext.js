import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useToast } from '../hooks/use-toast';

/**
 * 🚀 Analytics Context Provider
 * 
 * Features:
 * - Global filter management
 * - Real-time data synchronization
 * - Cross-component state sharing
 * - Optimized re-renders
 * - Performance monitoring
 */

// Initial state
const initialState = {
    // Global filters
    filters: {
        startDate: '',
        endDate: '',
        companyId: '',
        customerId: '',
        status: '',
        period: 'monthly'
    },

    // UI state
    isLoading: false,
    error: null,
    lastUpdated: null,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds

    // Cache management
    cacheEnabled: true,
    cacheDuration: 5 * 60 * 1000, // 5 minutes

    // Component visibility/state
    activeComponents: new Set(),
    componentStates: {},

    // Performance metrics
    performanceMetrics: {
        totalRequests: 0,
        failedRequests: 0,
        avgResponseTime: 0,
        cacheHitRate: 0
    }
};

// Action types
const actionTypes = {
    SET_FILTER: 'SET_FILTER',
    SET_FILTERS: 'SET_FILTERS',
    CLEAR_FILTERS: 'CLEAR_FILTERS',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_AUTO_REFRESH: 'SET_AUTO_REFRESH',
    UPDATE_LAST_UPDATED: 'UPDATE_LAST_UPDATED',
    REGISTER_COMPONENT: 'REGISTER_COMPONENT',
    UNREGISTER_COMPONENT: 'UNREGISTER_COMPONENT',
    UPDATE_COMPONENT_STATE: 'UPDATE_COMPONENT_STATE',
    UPDATE_PERFORMANCE_METRICS: 'UPDATE_PERFORMANCE_METRICS',
    SET_CACHE_SETTINGS: 'SET_CACHE_SETTINGS'
};

// Reducer function
function analyticsReducer(state, action) {
    switch (action.type) {
        case actionTypes.SET_FILTER:
            return {
                ...state,
                filters: {
                    ...state.filters,
                    [action.payload.key]: action.payload.value
                }
            };

        case actionTypes.SET_FILTERS:
            return {
                ...state,
                filters: {
                    ...state.filters,
                    ...action.payload
                }
            };

        case actionTypes.CLEAR_FILTERS:
            return {
                ...state,
                filters: {
                    ...initialState.filters,
                    period: state.filters.period // Keep period
                }
            };

        case actionTypes.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload
            };

        case actionTypes.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                isLoading: false
            };

        case actionTypes.SET_AUTO_REFRESH:
            return {
                ...state,
                autoRefresh: action.payload
            };

        case actionTypes.UPDATE_LAST_UPDATED:
            return {
                ...state,
                lastUpdated: new Date().toISOString(),
                error: null
            };

        case actionTypes.REGISTER_COMPONENT:
            return {
                ...state,
                activeComponents: new Set([...state.activeComponents, action.payload])
            };

        case actionTypes.UNREGISTER_COMPONENT:
            const newActiveComponents = new Set(state.activeComponents);
            newActiveComponents.delete(action.payload);
            return {
                ...state,
                activeComponents: newActiveComponents
            };

        case actionTypes.UPDATE_COMPONENT_STATE:
            return {
                ...state,
                componentStates: {
                    ...state.componentStates,
                    [action.payload.componentId]: {
                        ...state.componentStates[action.payload.componentId],
                        ...action.payload.state
                    }
                }
            };

        case actionTypes.UPDATE_PERFORMANCE_METRICS:
            return {
                ...state,
                performanceMetrics: {
                    ...state.performanceMetrics,
                    ...action.payload
                }
            };

        case actionTypes.SET_CACHE_SETTINGS:
            return {
                ...state,
                cacheEnabled: action.payload.enabled ?? state.cacheEnabled,
                cacheDuration: action.payload.duration ?? state.cacheDuration
            };

        default:
            return state;
    }
}

// Create context
const AnalyticsContext = createContext();

// Hook to use analytics context
export function useAnalyticsContext() {
    const context = useContext(AnalyticsContext);
    if (!context) {
        throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
    }
    return context;
}

// Analytics Provider Component
export function AnalyticsProvider({ children }) {
    const [state, dispatch] = useReducer(analyticsReducer, initialState);
    const { toast } = useToast();

    // Auto-refresh functionality
    useEffect(() => {
        if (!state.autoRefresh || state.activeComponents.size === 0) return;

        const interval = setInterval(() => {
            // Trigger refresh for all active components
            window.dispatchEvent(new CustomEvent('analytics:refresh', {
                detail: { timestamp: Date.now() }
            }));

            dispatch({ type: actionTypes.UPDATE_LAST_UPDATED });
        }, state.refreshInterval);

        return () => clearInterval(interval);
    }, [state.autoRefresh, state.refreshInterval, state.activeComponents.size]);

    // Filter management actions
    const setFilter = useCallback((key, value) => {
        dispatch({
            type: actionTypes.SET_FILTER,
            payload: { key, value }
        });
    }, []);

    const setFilters = useCallback((filters) => {
        dispatch({
            type: actionTypes.SET_FILTERS,
            payload: filters
        });
    }, []);

    const clearFilters = useCallback(() => {
        dispatch({ type: actionTypes.CLEAR_FILTERS });

        // Clear all component caches
        if (window.electron?.analytics?.clearCache) {
            window.electron.analytics.clearCache();
        }

        toast({
            title: "Filters Cleared",
            description: "All filters have been reset and cache cleared.",
        });
    }, [toast]);

    // Loading and error management
    const setLoading = useCallback((loading) => {
        dispatch({
            type: actionTypes.SET_LOADING,
            payload: loading
        });
    }, []);

    const setError = useCallback((error) => {
        dispatch({
            type: actionTypes.SET_ERROR,
            payload: error
        });

        if (error) {
            toast({
                title: "Analytics Error",
                description: error,
                variant: "destructive",
            });
        }
    }, [toast]);

    // Auto-refresh management
    const setAutoRefresh = useCallback((enabled) => {
        dispatch({
            type: actionTypes.SET_AUTO_REFRESH,
            payload: enabled
        });

        toast({
            title: enabled ? "Auto-refresh Enabled" : "Auto-refresh Disabled",
            description: enabled
                ? `Data will refresh every ${state.refreshInterval / 1000} seconds`
                : "Data will only refresh manually",
        });
    }, [state.refreshInterval, toast]);

    // Component lifecycle management
    const registerComponent = useCallback((componentId) => {
        dispatch({
            type: actionTypes.REGISTER_COMPONENT,
            payload: componentId
        });
    }, []);

    const unregisterComponent = useCallback((componentId) => {
        dispatch({
            type: actionTypes.UNREGISTER_COMPONENT,
            payload: componentId
        });
    }, []);

    const updateComponentState = useCallback((componentId, state) => {
        dispatch({
            type: actionTypes.UPDATE_COMPONENT_STATE,
            payload: { componentId, state }
        });
    }, []);

    // Performance tracking
    const trackRequest = useCallback((success, responseTime) => {
        const metrics = state.performanceMetrics;
        const newTotalRequests = metrics.totalRequests + 1;
        const newFailedRequests = success ? metrics.failedRequests : metrics.failedRequests + 1;
        const newAvgResponseTime = (metrics.avgResponseTime * metrics.totalRequests + responseTime) / newTotalRequests;

        dispatch({
            type: actionTypes.UPDATE_PERFORMANCE_METRICS,
            payload: {
                totalRequests: newTotalRequests,
                failedRequests: newFailedRequests,
                avgResponseTime: Math.round(newAvgResponseTime)
            }
        });
    }, [state.performanceMetrics]);

    // Cache management
    const setCacheSettings = useCallback((settings) => {
        dispatch({
            type: actionTypes.SET_CACHE_SETTINGS,
            payload: settings
        });
    }, []);

    const clearCache = useCallback(async () => {
        try {
            if (window.electron?.analytics?.clearCache) {
                await window.electron.analytics.clearCache();
                toast({
                    title: "Cache Cleared",
                    description: "All cached analytics data has been cleared.",
                });
            }
        } catch (error) {
            toast({
                title: "Cache Clear Failed",
                description: error.message,
                variant: "destructive",
            });
        }
    }, [toast]);

    // Refresh all data
    const refreshAll = useCallback(() => {
        setLoading(true);

        // Clear cache
        clearCache();

        // Trigger refresh event
        window.dispatchEvent(new CustomEvent('analytics:forceRefresh', {
            detail: { timestamp: Date.now() }
        }));

        setTimeout(() => {
            setLoading(false);
            dispatch({ type: actionTypes.UPDATE_LAST_UPDATED });
        }, 1000);
    }, [setLoading, clearCache]);

    // Export data functionality
    const exportData = useCallback(async (format = 'csv', components = []) => {
        try {
            setLoading(true);

            // Collect data from specified components
            const exportData = {};
            for (const componentId of components) {
                const componentState = state.componentStates[componentId];
                if (componentState?.data) {
                    exportData[componentId] = componentState.data;
                }
            }

            // Create export based on format
            if (format === 'csv') {
                // Convert to CSV format
                const csvData = convertToCSV(exportData);
                downloadFile(csvData, 'analytics-export.csv', 'text/csv');
            } else if (format === 'json') {
                // Export as JSON
                const jsonData = JSON.stringify(exportData, null, 2);
                downloadFile(jsonData, 'analytics-export.json', 'application/json');
            }

            toast({
                title: "Export Successful",
                description: `Analytics data exported as ${format.toUpperCase()}`,
            });
        } catch (error) {
            toast({
                title: "Export Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [state.componentStates, setLoading, toast]);

    // Helper function to convert data to CSV
    const convertToCSV = (data) => {
        // Simple CSV conversion - can be enhanced based on needs
        let csv = '';
        for (const [componentId, componentData] of Object.entries(data)) {
            csv += `\n\n=== ${componentId.toUpperCase()} ===\n`;
            if (Array.isArray(componentData)) {
                if (componentData.length > 0) {
                    const headers = Object.keys(componentData[0]);
                    csv += headers.join(',') + '\n';
                    csv += componentData.map(row =>
                        headers.map(header => row[header] || '').join(',')
                    ).join('\n');
                }
            } else {
                csv += Object.entries(componentData)
                    .map(([key, value]) => `${key},${value}`)
                    .join('\n');
            }
        }
        return csv;
    };

    // Helper function to download file
    const downloadFile = (content, filename, mimeType) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Context value
    const value = {
        // State
        ...state,

        // Filter actions
        setFilter,
        setFilters,
        clearFilters,

        // Loading and error actions
        setLoading,
        setError,

        // Auto-refresh actions
        setAutoRefresh,
        refreshAll,

        // Component management
        registerComponent,
        unregisterComponent,
        updateComponentState,

        // Performance tracking
        trackRequest,

        // Cache management
        setCacheSettings,
        clearCache,

        // Export functionality
        exportData,

        // Utility functions
        getComponentState: (componentId) => state.componentStates[componentId] || {},
        isComponentActive: (componentId) => state.activeComponents.has(componentId),
        getFilteredData: (data, customFilters = null) => {
            const filters = customFilters || state.filters;
            // Apply filtering logic based on current filters
            // This can be customized based on data structure
            return data; // Placeholder
        }
    };

    return (
        <AnalyticsContext.Provider value={value}>
            {children}
        </AnalyticsContext.Provider>
    );
}

// Higher-order component for analytics components
export function withAnalytics(WrappedComponent, componentId) {
    return function AnalyticsEnhancedComponent(props) {
        const analyticsContext = useAnalyticsContext();

        useEffect(() => {
            analyticsContext.registerComponent(componentId);
            return () => analyticsContext.unregisterComponent(componentId);
        }, [analyticsContext]);

        return (
            <WrappedComponent
                {...props}
                analyticsContext={analyticsContext}
                componentId={componentId}
            />
        );
    };
}

export default AnalyticsContext; 