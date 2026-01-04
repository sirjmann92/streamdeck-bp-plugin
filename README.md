# Steam Big Picture Controller - Stream Deck Plugin

A smart Stream Deck plugin that provides intelligent Steam launcher control with Big Picture mode toggling.

## Features

### 🎮 Smart Single-Button Control
- **Not running** → Launches Steam
- **Running (normal)** → Enters Big Picture mode
- **In Big Picture** → Exits to standard mode
- **Long press (2s)** → Close window or exit Steam completely (configurable)

### 👁️ Dynamic Visual Feedback
- **Greyed icon** - Steam is not running
- **Normal icon** - Steam running in standard mode
- **Highlighted icon** - Big Picture mode active
- Updates automatically every 3 seconds

### ⚙️ Configurable Settings
- **Always open in Big Picture** - Launch Steam directly into Big Picture mode
- **Long-press action** - Choose between:
  - Do nothing
  - Close window (sends Alt+F4 to Steam)
  - Exit Steam completely
- Auto-detects Steam installation location from Windows registry

## Requirements

- **Windows 10** or later
- **Stream Deck software** version 6.0+
- **Node.js** version 16.0+ (for development)
- **Steam** installed

## Installation

### Method 1: Install from .streamDeckPlugin file (Recommended)

1. Download the latest `.streamDeckPlugin` file from releases
2. Double-click the file to install
3. The plugin will appear in your Stream Deck software

### Method 2: Manual Development Installation

1. Clone this repository
2. Install dependencies: `npm install`
3. Build and install: `npm run build && npm run install-plugin`
4. Restart Stream Deck software

## Usage

1. **Add the action** - Drag "Steam Big Picture Toggle" to a button
2. **Configure settings** (optional):
   - Enable "Always open in Big Picture mode" if desired
   - Choose long-press behavior (2 second hold)
3. **Use it!**
   - Short press to launch/toggle Steam and Big Picture
   - Long press (2s) for close/exit actions

## Configuration Options

### Always Open in Big Picture Mode
- When enabled, launching Steam automatically enters Big Picture mode

### Long Press Action (2 second hold)
- **Do nothing** - Long press has no effect (default)
- **Close window** - Sends Alt+F4 to Steam (respects tray settings)
- **Exit Steam completely** - Gracefully shuts down Steam

## Troubleshooting

### Plugin won't uninstall
- Close Stream Deck completely (right-click system tray → Quit)
- Manually delete: `%appdata%\Elgato\StreamDeck\Plugins\com.jase.steambp.sdPlugin`
- Restart Stream Deck

### Close window closes wrong application
- Windows restricts background apps from stealing focus
- Use "Exit Steam completely" for reliable shutdown

### Icons don't update
- State polling runs every 3 seconds
- Check logs: `bin/plugin.log` in plugin directory

## License

MIT License - See LICENSE file for details
