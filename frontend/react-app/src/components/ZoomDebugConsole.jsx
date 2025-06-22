import React, { useEffect, useState } from 'react';

const ZoomDebugConsole = () => {
    const [logs, setLogs] = useState([]);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Listen for keyboard shortcut to toggle debug console (Ctrl+Shift+Z)
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
                e.preventDefault();
                setIsVisible(!isVisible);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        // Subscribe to zoom changes if available
        if (window.electron?.zoom) {
            const unsubscribe = window.electron.zoom.onZoomChanged((data) => {
                const timestamp = new Date().toLocaleTimeString();
                const logEntry = {
                    timestamp,
                    type: 'zoom-change',
                    data,
                    message: `Zoom ${data.direction}: ${data.percentage}% (Level: ${data.zoomLevel.toFixed(1)}, Factor: ${data.zoomFactor.toFixed(2)}x)`
                };

                setLogs(prev => [logEntry, ...prev.slice(0, 49)]); // Keep last 50 logs
            });

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                if (unsubscribe) unsubscribe();
            };
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isVisible]);

    const testZoomLevels = async () => {
        if (!window.electron?.zoom) return;

        const testLevels = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];

        for (const level of testLevels) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await window.electron.zoom.setLevel(level);

            const timestamp = new Date().toLocaleTimeString();
            setLogs(prev => [{
                timestamp,
                type: 'test',
                data: { level },
                message: `Test: Set zoom level to ${level}`
            }, ...prev.slice(0, 49)]);
        }

        // Reset to normal
        await new Promise(resolve => setTimeout(resolve, 1000));
        await window.electron.zoom.setLevel(0);
    };

    const clearLogs = () => setLogs([]);

    if (!isVisible) {
        return (
            <div style={{
                position: 'fixed',
                bottom: '10px',
                left: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                fontFamily: 'monospace',
                zIndex: 9998
            }}>
                Press Ctrl+Shift+Z to open zoom debug console
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            left: '10px',
            width: '400px',
            height: '300px',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontFamily: 'monospace',
            fontSize: '11px',
            zIndex: 9998,
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                padding: '8px 12px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span>🔍 Zoom Debug Console</span>
                <button
                    onClick={() => setIsVisible(false)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    ×
                </button>
            </div>

            {/* Controls */}
            <div style={{
                padding: '8px 12px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
            }}>
                <button
                    onClick={testZoomLevels}
                    style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '10px'
                    }}
                >
                    Test All Levels
                </button>

                {[-2, -1, 0, 1, 2].map(level => (
                    <button
                        key={level}
                        onClick={() => window.electron?.zoom?.setLevel(level)}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '10px'
                        }}
                    >
                        {level === 0 ? '100%' : `${Math.round(Math.pow(1.2, level) * 100)}%`}
                    </button>
                ))}

                <button
                    onClick={clearLogs}
                    style={{
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '10px'
                    }}
                >
                    Clear
                </button>
            </div>

            {/* Logs */}
            <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '8px 12px'
            }}>
                {logs.length === 0 ? (
                    <div style={{ opacity: 0.5, textAlign: 'center', marginTop: '20px' }}>
                        No zoom events yet. Try using Ctrl+/- or the buttons above.
                    </div>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} style={{
                            marginBottom: '4px',
                            padding: '2px 0',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <span style={{ opacity: 0.6 }}>[{log.timestamp}]</span>
                            <span style={{
                                color: log.type === 'test' ? '#FFA726' : log.type === 'zoom-change' ? '#4CAF50' : '#ffffff',
                                marginLeft: '8px'
                            }}>
                                {log.message}
                            </span>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div style={{
                padding: '4px 12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: '9px',
                opacity: 0.6,
                textAlign: 'center'
            }}>
                Use Ctrl+/- to zoom | Ctrl+Shift+Z to toggle console
            </div>
        </div>
    );
};

export default ZoomDebugConsole; 