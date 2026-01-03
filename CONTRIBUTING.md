# Contributing to Steam Big Picture

Thanks for your interest in contributing! This document provides guidelines for contributing to this project.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your feature/fix
4. Make your changes
5. Test on Windows with Stream Deck
6. Submit a pull request

## Development Environment

### Requirements
- Windows 10 or later
- Node.js 16.0+
- Stream Deck software 6.0+
- Steam installed

### Setup
```bash
git clone https://github.com/sirjmann92/streamdeck-bp-plugin.git
cd SteamBP-streamdeck-plugin
npm install
```

### Testing
```bash
npm run install-plugin
# Restart Stream Deck software
```

## Code Style

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Add comments for complex logic
- Keep functions focused and small

## Pull Request Process

1. **Update documentation** - README, code comments, etc.
2. **Test thoroughly** - All three states (off/on/bigpicture)
3. **Update CHANGELOG** with your changes
4. **Describe your changes** clearly in the PR description
5. **Reference issues** if applicable

## Bug Reports

When filing a bug report, please include:
- Windows version
- Stream Deck software version
- Steam version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages (check `%APPDATA%\Elgato\StreamDeck\logs\`)

## Feature Requests

Feature requests are welcome! Please:
- Check existing issues first
- Describe the use case
- Explain why it would be useful
- Consider implementation complexity

## Testing Checklist

Before submitting a PR, test:
- [ ] Steam not running → Launch works
- [ ] Steam running → Enter Big Picture works
- [ ] In Big Picture → Exit to normal works
- [ ] Always open in Big Picture works (if configured)
- [ ] Long press actions work (if configured)
- [ ] Icons update correctly for each state
- [ ] Settings UI saves correctly
- [ ] No console errors

## Areas for Contribution

- **Icon improvements** - Better designs, animations
- **Settings enhancements** - More configuration options
- **Performance** - Faster state detection
- **Documentation** - Tutorials, screenshots, videos
- **Testing** - Edge cases, error handling

## Questions?

Open an issue or discussion on GitHub.

Thank you for contributing! 🎮
