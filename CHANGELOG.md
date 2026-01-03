# Changelog

## [1.0.0] - 2025-12-18

### Features
- Smart single-button Steam control (launch → Big Picture → exit)
- Three-state dynamic icons (off/on/bigpicture)
- Always open in Big Picture mode option
- Long-press actions (2 second hold):
  - Close window (Alt+F4)
  - Exit Steam completely
- Auto-detect Steam installation path from registry
- State polling every 3 seconds
- Minimal logging to plugin directory

### Technical
- Built with Node.js and Stream Deck SDK v2
- Uses Steam protocol URLs for Big Picture control
- VBScript for window activation and closing
- PowerShell for process detection
- Supports custom Steam installation paths

### Known Limitations
- Close window feature may occasionally activate wrong window due to Windows focus restrictions
- Exit Steam completely is more reliable for shutdown
