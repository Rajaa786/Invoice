import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

/**
 * React Performance Monitor
 * Tracks re-renders, API calls, and performance metrics
 */
export const ReactPerformanceMonitor = ({ componentName = 'Unknown' }) => {
    const renderCountRef = useRef(0);
    const apiCallCountRef = useRef(0);
    const lastRenderTime = useRef(Date.now());
    const [metrics, setMetrics] = useState({
        totalRenders: 0,
        avgRenderTime: 0,
        apiCalls: 0,
        lastRenderDuration: 0,
        renderFrequency: 0
    });

    // Track render count and timing
    useEffect(() => {
        const now = Date.now();
        const renderDuration = now - lastRenderTime.current;
        renderCountRef.current += 1;

        // Calculate render frequency (renders per second)
        const timeDiff = now - (window.performanceMonitorStart || now);
        const renderFrequency = timeDiff > 0 ? (renderCountRef.current * 1000) / timeDiff : 0;

        setMetrics(prev => ({
            totalRenders: renderCountRef.current,
            avgRenderTime: (prev.avgRenderTime + renderDuration) / 2,
            apiCalls: apiCallCountRef.current,
            lastRenderDuration: renderDuration,
            renderFrequency: renderFrequency.toFixed(2)
        }));

        lastRenderTime.current = now;

        // Set global start time if not set
        if (!window.performanceMonitorStart) {
            window.performanceMonitorStart = now;
        }

        // Log excessive re-renders
        if (renderCountRef.current > 10 && renderFrequency > 5) {
            console.warn(`🚨 [Performance] ${componentName} is re-rendering excessively:`, {
                totalRenders: renderCountRef.current,
                frequency: renderFrequency + ' renders/sec',
                lastDuration: renderDuration + 'ms'
            });
        }
    });

    // Intercept and count API calls
    useEffect(() => {
        const originalFetch = window.fetch;
        const originalConsoleLog = console.log;

        // Intercept console.log for API tracking
        console.log = (...args) => {
            const message = args[0];
            if (typeof message === 'string' &&
                (message.includes('Setting config') ||
                    message.includes('Getting setting') ||
                    message.includes('Retrieved setting'))) {
                apiCallCountRef.current += 1;
            }
            originalConsoleLog.apply(console, args);
        };

        // Intercept fetch for HTTP API calls
        window.fetch = async (...args) => {
            apiCallCountRef.current += 1;
            return originalFetch.apply(window, args);
        };

        return () => {
            window.fetch = originalFetch;
            console.log = originalConsoleLog;
        };
    }, []);

    const resetMetrics = () => {
        renderCountRef.current = 0;
        apiCallCountRef.current = 0;
        window.performanceMonitorStart = Date.now();
        setMetrics({
            totalRenders: 0,
            avgRenderTime: 0,
            apiCalls: 0,
            lastRenderDuration: 0,
            renderFrequency: 0
        });
    };

    const getPerformanceStatus = () => {
        if (metrics.renderFrequency > 5) return 'critical';
        if (metrics.renderFrequency > 2) return 'warning';
        return 'good';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'critical': return 'destructive';
            case 'warning': return 'secondary';
            default: return 'default';
        }
    };

    return (
        <Card className="mb-4">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                    <span>⚡ Performance Monitor: {componentName}</span>
                    <Badge variant={getStatusColor(getPerformanceStatus())}>
                        {getPerformanceStatus().toUpperCase()}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="text-center">
                        <div className="font-semibold text-blue-600">{metrics.totalRenders}</div>
                        <div className="text-xs text-gray-500">Total Renders</div>
                    </div>
                    <div className="text-center">
                        <div className="font-semibold text-green-600">{metrics.renderFrequency}</div>
                        <div className="text-xs text-gray-500">Renders/sec</div>
                    </div>
                    <div className="text-center">
                        <div className="font-semibold text-orange-600">{metrics.apiCalls}</div>
                        <div className="text-xs text-gray-500">API Calls</div>
                    </div>
                    <div className="text-center">
                        <div className="font-semibold text-purple-600">{metrics.lastRenderDuration}ms</div>
                        <div className="text-xs text-gray-500">Last Render</div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <Button variant="outline" size="sm" onClick={resetMetrics}>
                        Reset Metrics
                    </Button>
                </div>

                {getPerformanceStatus() === 'critical' && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        <strong>⚠️ Performance Issue:</strong> Component is re-rendering too frequently.
                        Check for unstable dependencies in useEffect, useCallback, or useMemo.
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ReactPerformanceMonitor; 