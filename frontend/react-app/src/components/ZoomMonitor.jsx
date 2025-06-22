import React, { useState, useEffect } from 'react';

const ZoomMonitor = ({ position = 'top-right', visible = true }) => {
    const [zoomData, setZoomData] = useState({
        zoomLevel: 0,
        zoomFactor: 1,
        percentage: 100,
        direction: 'initial'
    });

    useEffect(() => {
        if (!window.electron?.zoom) {
            console.warn('Zoom API not available');
            return;
        }

        // Get initial zoom level
        window.electron.zoom.getLevel().then(data => {
            setZoomData({
                ...data,
                percentage: Math.round(data.zoomFactor * 100),
                direction: 'initial'
            });
        });

        // Subscribe to zoom changes
        const unsubscribe = window.electron.zoom.onZoomChanged((data) => {
            console.log('🔍 React: Zoom changed:', data);
            setZoomData(data);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const handleZoomChange = async (level) => {
        if (window.electron?.zoom) {
            await window.electron.zoom.setLevel(level);
        }
    };

    const getPositionStyles = () => {
        const baseStyles = {
            position: 'fixed',
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'monospace',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(4px)'
        };

        switch (position) {
            case 'top-left':
                return { ...baseStyles, top: '10px', left: '10px' };
            case 'top-right':
                return { ...baseStyles, top: '10px', right: '10px' };
            case 'bottom-left':
                return { ...baseStyles, bottom: '10px', left: '10px' };
            case 'bottom-right':
                return { ...baseStyles, bottom: '10px', right: '10px' };
            default:
                return { ...baseStyles, top: '10px', right: '10px' };
        }
    };

    const getDirectionEmoji = (direction) => {
        switch (direction) {
            case 'in': return '🔍+';
            case 'out': return '🔍-';
            case 'programmatic': return '⚙️';
            default: return '🔍';
        }
    };

    const getZoomColor = (percentage) => {
        if (percentage < 50) return '#ff6b6b';
        if (percentage < 75) return '#ffa726';
        if (percentage > 150) return '#42a5f5';
        if (percentage > 125) return '#66bb6a';
        return '#ffffff';
    };

    if (!visible) return null;

    return (
        <div style={getPositionStyles()}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{getDirectionEmoji(zoomData.direction)}</span>
                    <span style={{ color: getZoomColor(zoomData.percentage), fontWeight: 'bold' }}>
                        {zoomData.percentage}%
                    </span>
                </div>

                <div style={{ fontSize: '10px', opacity: 0.7 }}>
                    Level: {zoomData.zoomLevel.toFixed(1)} | Factor: {zoomData.zoomFactor.toFixed(2)}x
                </div>

                {/* Quick zoom controls */}
                <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                    {[0.5, 0, -0.5, -1].map(level => (
                        <button
                            key={level}
                            onClick={() => handleZoomChange(level)}
                            style={{
                                backgroundColor: zoomData.zoomLevel === level ? '#4CAF50' : 'rgba(255,255,255,0.1)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                fontSize: '10px',
                                cursor: 'pointer'
                            }}
                        >
                            {level === 0 ? '100%' : `${Math.round(Math.pow(1.2, level) * 100)}%`}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ZoomMonitor; 