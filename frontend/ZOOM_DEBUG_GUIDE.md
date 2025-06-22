# 🔍 Zoom Level Debugging Guide

This guide explains how to monitor and debug zoom levels in your Electron React app.

## Features Added

### 1. **Real-time Zoom Monitor** (Top-right corner)

- Shows current zoom percentage
- Displays zoom level and factor
- Color-coded based on zoom level
- Quick zoom buttons for common levels
- Only visible in development mode

### 2. **Debug Console** (Bottom-left corner)

- Toggle with `Ctrl+Shift+Z`
- Logs all zoom events with timestamps
- Manual zoom level testing
- Automated zoom level sequence testing

## Zoom Level Reference

### Understanding Zoom Values

| Zoom Level | Zoom Factor | Percentage | Description          |
| ---------- | ----------- | ---------- | -------------------- |
| -2.0       | 0.69x       | 69%        | Very Small           |
| -1.5       | 0.78x       | 78%        | Small                |
| -1.0       | 0.83x       | 83%        | Smaller              |
| -0.5       | 0.91x       | 91%        | Slightly Smaller     |
| 0.0        | 1.00x       | 100%       | **Normal (Default)** |
| 0.5        | 1.10x       | 110%       | Slightly Larger      |
| 1.0        | 1.20x       | 120%       | Larger               |
| 1.5        | 1.32x       | 132%       | Large                |
| 2.0        | 1.44x       | 144%       | Very Large           |

### Formula

```
Zoom Factor = 1.2^(Zoom Level)
Percentage = Zoom Factor × 100
```

## Keyboard Shortcuts

- `Ctrl + Plus (+)` - Zoom In
- `Ctrl + Minus (-)` - Zoom Out
- `Ctrl + 0` - Reset to 100%
- `Ctrl + Shift + Z` - Toggle Debug Console

## Usage Instructions

### 1. **Start Your App**

```bash
cd frontend
npm start
```

### 2. **Monitor Zoom Changes**

- The zoom monitor appears in the top-right corner (development only)
- Use `Ctrl + Plus/Minus` to zoom in/out
- Watch the real-time updates in the monitor

### 3. **Debug Console**

- Press `Ctrl+Shift+Z` to open the debug console
- Click "Test All Levels" to automatically cycle through zoom levels
- Use manual zoom buttons for specific levels
- View detailed logs of all zoom events

### 4. **Console Logging**

Check your Electron main process console for detailed zoom logs:

```
🔍 ZOOM CHANGED: Direction: in, Level: 0.5, Factor: 1.10x (110%)
🔍 ZOOM CHANGED: Direction: out, Level: -0.5, Factor: 0.91x (91%)
```

## API Reference

### Available APIs (via `window.electron.zoom`)

```javascript
// Get current zoom level
const { zoomLevel, zoomFactor } = await window.electron.zoom.getLevel();

// Set zoom level
await window.electron.zoom.setLevel(1.0); // 120%

// Listen to zoom changes
const unsubscribe = window.electron.zoom.onZoomChanged((data) => {
  console.log("Zoom changed:", data);
  // data: { zoomLevel, zoomFactor, percentage, direction }
});

// Clean up listener
unsubscribe();
```

## Common Zoom Levels for Testing

### UI Testing Recommendations

- **Small Screens**: Test at 80-90% (levels -1.0 to -0.5)
- **Normal Usage**: 100% (level 0.0)
- **Large Screens**: Test at 110-125% (levels 0.5 to 1.0)
- **Accessibility**: Test at 150%+ (levels 1.5+)

### Responsive Design Testing

1. **Mobile Simulation**: 67% (-2.0 level)
2. **Tablet Simulation**: 83% (-1.0 level)
3. **Desktop Normal**: 100% (0.0 level)
4. **Large Display**: 125% (1.0 level)
5. **Accessibility**: 150% (1.5 level)

## Troubleshooting

### Zoom Monitor Not Showing

- Ensure you're in development mode
- Check browser console for errors
- Verify Electron APIs are available

### Console Logs Not Appearing

- Check Electron main process console (not browser console)
- Ensure zoom monitoring is registered in main.js

### Keyboard Shortcuts Not Working

- Make sure the Electron window has focus
- Check if other apps are intercepting the shortcuts
- Try clicking in the app window first

## Color Coding

The zoom monitor uses color coding for quick visual reference:

- 🔴 **Red**: Very small (< 50%)
- 🟠 **Orange**: Small (50-75%)
- ⚪ **White**: Normal (75-125%)
- 🟢 **Green**: Large (125-150%)
- 🔵 **Blue**: Very large (> 150%)

## Performance Notes

- Zoom monitoring has minimal performance impact
- Debug console logs are limited to 50 entries
- Components only render in development mode
- Event listeners are properly cleaned up on unmount

## Integration with Your App

The zoom monitoring is automatically integrated and will:

1. Show zoom monitor in top-right corner (development only)
2. Provide debug console via `Ctrl+Shift+Z`
3. Log all zoom events to Electron main process console
4. Work with both keyboard shortcuts and programmatic zoom changes

No additional setup required - just start your app and begin testing!
