# Steam Big Picture Controller

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/platform-Windows-blue.svg)](https://www.microsoft.com/windows)

> Smart Stream Deck plugin for Steam with intelligent Big Picture mode control

![Plugin Demo](docs/demo.gif)
<!-- Add demo GIF after testing -->

## ✨ Features

### 🎮 One-Button Smart Control
- **Steam not running** → Launches Steam
- **Steam running** → Enters Big Picture mode
- **In Big Picture** → Exits to standard mode (with optional resize)
- **Long press** → Fully exits Steam (configurable)

### 🎨 Visual Feedback
- **Greyed icon** - Steam is offline
- **Blue icon** - Steam running normally
- **Bright cyan icon** - Big Picture mode active

### ⚙️ Customizable Settings
- Set custom window dimensions (e.g., 1920x1080) when exiting Big Picture
- Configure long-press behavior
- Auto-detects Steam installation

## 📋 Requirements

- **Windows 10+**
- **Stream Deck Software 6.0+**
- **Node.js 16.0+** (for development)
- **Steam** (any recent version)

## 🚀 Installation

### For Users (Stream Deck Marketplace)
1. Open Stream Deck software
2. Search for "Steam Big Picture Controller"
3. Click Install
4. Drag to a button and enjoy!

### For Users (Manual Install)
1. Download the latest `.streamDeckPlugin` file from [Releases](https://github.com/sirjmann92/streamdeck-bp-plugin/releases)
2. Double-click the file to install
3. Restart Stream Deck software

### For Developers
```bash
git clone https://github.com/sirjmann92/streamdeck-bp-plugin.git
cd SteamBP-streamdeck-plugin
npm install
npm run build
npm run install-plugin
```

Then restart Stream Deck software.

## 🎯 Usage

1. **Add the action** to your Stream Deck
2. **Configure settings** (optional):
   - Right-click the button
   - Set window dimensions if desired
   - Choose long-press behavior
3. **Press the button**:
   - Short press: Smart toggle (launch → BP → exit)
   - Long press: Exit Steam (if enabled)

## 🛠️ Configuration

### Window Resize
Configure Steam to restore to a specific size when exiting Big Picture:
- Enable "Resize Steam window when exiting Big Picture"
- Set Width (800-7680 pixels)
- Set Height (600-4320 pixels)

### Long Press Action
- **Do nothing** (default)
- **Exit Steam completely** - Useful for fully closing Steam

## 📖 How It Works

### State Detection
- Checks if `steam.exe` is running
- Detects Big Picture via window title/class
- Updates every 3 seconds automatically

### Steam Control
- **Launch**: Searches common paths, uses Steam protocol
- **Big Picture**: `steam://open/bigpicture`
- **Exit BP**: `steam://nav/exit` + optional resize
- **Close**: Graceful process termination

## 🐛 Troubleshooting

### Button shows wrong state
- Wait 3 seconds for polling to update
- Restart Stream Deck software
- Check if Steam is in a non-standard location

### Big Picture not detected
- Update to latest Steam version
- Check for `steamwebhelper.exe` in Task Manager
- Submit an issue with your Steam version

### Window resize not working
- Ensure dimensions are within valid range
- Steam window must be visible (not minimized)
- Wait 2 seconds after exiting Big Picture

### Long press not working
- Enable in settings first
- Hold for ~1 second
- Requires Stream Deck software 6.0+

## 🗺️ Roadmap

- [ ] Game launch shortcuts
- [ ] Steam library integration
- [ ] Minimize to tray option
- [ ] Configurable polling interval
- [ ] Multi-monitor support
- [ ] Linux/macOS support (future)

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development
```bash
# Install dependencies
npm install

# Install to Stream Deck for testing
npm run install-plugin

# Build release package
npm run build
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Elgato Stream Deck SDK](https://developer.elgato.com/documentation/stream-deck/)
- Steam community for protocol documentation
- Contributors and testers

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/sirjmann92/streamdeck-bp-plugin/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sirjmann92/streamdeck-bp-plugin/discussions)

---

Made with ❤️ for the Stream Deck and Steam community
