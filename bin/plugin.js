const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Setup logging to plugin directory
const logFile = path.join(__dirname, 'plugin.log');

// Logging to file
function log(...args) {
  const message = `[${new Date().toISOString()}] ${args.join(' ')}\n`;
  console.log(...args);
  try {
    fs.appendFileSync(logFile, message);
  } catch (e) {
    console.error('Failed to write to log:', e.message);
  }
}

// Clear previous log
try {
  fs.writeFileSync(logFile, '');
} catch (e) {
  console.error('Failed to initialize log:', e.message);
}

log('Steam Big Picture Plugin Starting');
log('Log file:', logFile);

// Stream Deck WebSocket connection
let websocket = null;
let pluginUUID = null;

// State constants
const STATE_OFF = 0;        // Steam not running
const STATE_ON = 1;         // Steam running (normal mode)
const STATE_BIGPICTURE = 2; // Steam in Big Picture mode

// Store context settings
const contextSettings = new Map();

/**
 * Main plugin class
 */
class SteamBigPicturePlugin {
  constructor() {
    this.pollingInterval = null;
    this.contexts = new Map();
    this.keyDownTimestamps = new Map(); // Track key press timing for long-press detection
    this.closingSteam = false; // Prevent multiple simultaneous close attempts
  }

  /**
   * Check if Steam is running
   */
  async isSteamRunning() {
    try {
      const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq steam.exe" /NH');
      return stdout.toLowerCase().includes('steam.exe');
    } catch (error) {
      log('Error checking Steam process:', error.message);
      return false;
    }
  }

  /**
   * Check if Steam is in Big Picture mode
   */
  async isBigPictureMode() {
    try {
      const script = `(Get-Process -Name steamwebhelper -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -match 'Steam Big Picture Mode' } | Select-Object -First 1) -ne $null`;
      const { stdout } = await execAsync(`powershell -Command "${script}"`);
      return stdout.trim() === 'True';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current Steam state
   */
  async getSteamState() {
    const running = await this.isSteamRunning();
    if (!running) return STATE_OFF;

    const bigPicture = await this.isBigPictureMode();
    log('Big Picture check:', bigPicture);
    
    const state = bigPicture ? STATE_BIGPICTURE : STATE_ON;
    log('Final determined state:', state, '(0=off, 1=on, 2=bigpicture)');
    return state;
  }

  /**
   * Get Steam installation path from registry
   */
  async getSteamPath() {
    try {
      // Check registry for Steam installation path
      const { stdout } = await execAsync('reg query "HKCU\\Software\\Valve\\Steam" /v SteamExe 2>nul');
      const match = stdout.match(/SteamExe\s+REG_SZ\s+(.+)/i);
      if (match && match[1]) {
        const steamPath = match[1].trim();
        log('Found Steam in registry:', steamPath);
        return steamPath;
      }
    } catch (error) {
      log('Registry lookup failed:', error.message);
    }

    // Fallback to common paths
    const commonPaths = [
      'C:\\Program Files (x86)\\Steam\\steam.exe',
      'C:\\Program Files\\Steam\\steam.exe',
      'C:\\Games\\Steam\\steam.exe'
    ];

    for (const path of commonPaths) {
      try {
        await execAsync(`if exist "${path}" exit 0 else exit 1`);
        log('Found Steam at:', path);
        return path;
      } catch (err) {
        continue;
      }
    }

    log('Steam not found in registry or common paths');
    return null;
  }

  /**
   * Launch Steam
   */
  async launchSteam() {
    try {
      const steamPath = await this.getSteamPath();
      
      if (steamPath) {
        await execAsync(`start "" "${steamPath}"`);
        log('Steam launched successfully from:', steamPath);
        return true;
      }

      // Last resort: try steam:// protocol
      log('Trying steam:// protocol as fallback');
      await execAsync('start steam://open/main');
      log('Steam launch attempted via protocol');
      return true;
    } catch (error) {
      log('Error launching Steam:', error.message);
      return false;
    }
  }

  /**
   * Enter Big Picture mode
   */
  async enterBigPicture() {
    try {
      await execAsync('start steam://open/bigpicture');
      log('Entering Big Picture mode');
      return true;
    } catch (error) {
      log('Error entering Big Picture:', error.message);
      return false;
    }
  }

  /**
   * Exit Big Picture mode
   */
  async exitBigPicture(context) {
    try {
      // Exit Big Picture mode using the close protocol
      await execAsync('start steam://close/bigpicture');
      log('Exiting Big Picture mode');
      return true;
    } catch (error) {
      log('Error exiting Big Picture:', error.message);
      return false;
    }
  }



  /**
   * Close Steam window (minimizes to tray if configured)
   */
  async closeSteamWindow() {
    if (this.closingSteam) return false;
    
    try {
      this.closingSteam = true;
      const vbsPath = path.join(__dirname, 'closeSteam.vbs');
      await execAsync(`cscript //nologo "${vbsPath}"`);
      return true;
    } catch (error) {
      log('Error closing Steam:', error.message);
      return false;
    } finally {
      this.closingSteam = false;
    }
  }

  /**
   * Exit Steam completely
   */
  async exitSteam() {
    try {
      const steamPath = await this.getSteamPath();
      if (steamPath) {
        await execAsync(`"${steamPath}" -shutdown`);
        log('Steam shutdown initiated gracefully');
      } else {
        // Fallback to taskkill if we can't find Steam path
        await execAsync('taskkill /IM steam.exe /F');
        log('Steam exited via taskkill (fallback)');
      }
      return true;
    } catch (error) {
      log('Error exiting Steam:', error.message);
      return false;
    }
  }

  /**
   * Handle key down (button press)
   */
  async handleKeyDown(context, settings) {
    const currentState = await this.getSteamState();

    switch (currentState) {
      case STATE_OFF:
        // Launch Steam - directly into Big Picture if configured
        if (settings && settings.alwaysBigPicture) {
          log('Launching Steam directly into Big Picture mode...');
          await this.enterBigPicture();
          this.updateState(context, STATE_BIGPICTURE);
        } else {
          log('Launching Steam...');
          await this.launchSteam();
          this.updateState(context, STATE_ON);
        }
        break;

      case STATE_ON:
        // Enter Big Picture mode
        log('Entering Big Picture mode...');
        await this.enterBigPicture();
        this.updateState(context, STATE_BIGPICTURE);
        break;

      case STATE_BIGPICTURE:
        // Exit Big Picture mode (with optional resize)
        log('Exiting Big Picture mode...');
        await this.exitBigPicture(context);
        this.updateState(context, STATE_ON);
        break;
    }

    // Update state after a short delay
    setTimeout(() => this.updateAllContextStates(), 1500);
  }

  /**
   * Handle long press (2 seconds)
   */
  async handleLongPress(context, settings) {
    const action = settings?.longPressAction || 'none';
    log('Long press action:', action);
    
    if (action === 'close') {
      await this.closeSteamWindow();
    } else if (action === 'exit') {
      const running = await this.isSteamRunning();
      if (running) {
        await this.exitSteam();
        this.updateState(context, STATE_OFF);
        setTimeout(() => this.updateAllContextStates(), 500);
      }
    }
  }

  /**
   * Update button state
   */
  updateState(context, state) {
    if (websocket) {
      websocket.send(JSON.stringify({
        event: 'setState',
        context: context,
        payload: {
          state: state
        }
      }));
    }
  }

  /**
   * Start polling for state changes
   */
  startPolling() {
    if (this.pollingInterval) return;

    this.pollingInterval = setInterval(async () => {
      await this.updateAllContextStates();
    }, 3000); // Check every 3 seconds
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Update all registered contexts with current state
   */
  async updateAllContextStates() {
    const currentState = await this.getSteamState();
    for (const context of this.contexts.keys()) {
      this.updateState(context, currentState);
    }
  }

  /**
   * Register a new context
   */
  registerContext(context, settings) {
    this.contexts.set(context, settings);
    contextSettings.set(context, settings);
    this.updateAllContextStates();
  }

  /**
   * Unregister a context
   */
  unregisterContext(context) {
    this.contexts.delete(context);
    contextSettings.delete(context);
  }
}

// Create plugin instance
const plugin = new SteamBigPicturePlugin();

/**
 * Connect to Stream Deck WebSocket
 */
function connectElgatoStreamDeckSocket(port, uuid, registerEvent, info) {
  pluginUUID = uuid;
  
  log('Connecting to Stream Deck on port:', port);
  log('Plugin UUID:', uuid);
  log('Register Event:', registerEvent);
  
  websocket = new WebSocket(`ws://127.0.0.1:${port}`);

  websocket.on('open', () => {
    log('Connected to Stream Deck successfully');
    
    // Register plugin
    const registerPayload = {
      event: registerEvent,
      uuid: uuid
    };
    log('Registering plugin:', JSON.stringify(registerPayload));
    websocket.send(JSON.stringify(registerPayload));

    // Start polling for state changes
    plugin.startPolling();
    log('State polling started');
  });

  websocket.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      log('Received message:', message.event, 'context:', message.context);
      
      switch (message.event) {
        case 'keyDown':
          log('Processing keyDown event');
          // Record timestamp for long-press detection
          const timestamp = Date.now();
          plugin.keyDownTimestamps.set(message.context, timestamp);
          
          // Set timer for long press
          const longPressTimer = setTimeout(async () => {
            // Check if key is still held down
            if (plugin.keyDownTimestamps.get(message.context) === timestamp) {
              log('Long press threshold reached (2000ms)');
              plugin.keyDownTimestamps.delete(message.context);
              await plugin.handleLongPress(message.context, message.payload.settings);
            }
          }, 2000);
          
          // Store timer so we can cancel it on keyUp
          plugin.keyDownTimestamps.set(message.context + '_timer', longPressTimer);
          break;

        case 'keyUp':
          log('Processing keyUp event');
          // Check if this was a long press or normal press
          const keyDownTime = plugin.keyDownTimestamps.get(message.context);
          const timer = plugin.keyDownTimestamps.get(message.context + '_timer');
          
          if (timer) {
            clearTimeout(timer);
            plugin.keyDownTimestamps.delete(message.context + '_timer');
          }
          
          if (keyDownTime) {
            const pressDuration = Date.now() - keyDownTime;
            log(`Press duration: ${pressDuration}ms`);
            plugin.keyDownTimestamps.delete(message.context);
            
            // Only handle as normal press if it was released before 2000ms
            if (pressDuration < 2000) {
              await plugin.handleKeyDown(message.context, message.payload.settings);
            }
            // If >= 2000ms, the long press handler already fired from the timer
          }
          break;

        case 'willAppear':
          log('Action appeared on Stream Deck');
          plugin.registerContext(message.context, message.payload.settings);
          break;

        case 'willDisappear':
          log('Action removed from Stream Deck');
          plugin.unregisterContext(message.context);
          break;

        case 'didReceiveSettings':
          log('Settings updated for context:', message.context);
          log('New settings:', JSON.stringify(message.payload.settings));
          contextSettings.set(message.context, message.payload.settings);
          break;
        
        case 'propertyInspectorDidAppear':
          log('Property Inspector opened for context:', message.context);
          // Send current settings to Property Inspector
          const currentSettings = contextSettings.get(message.context) || {};
          log('Sending current settings to PI:', JSON.stringify(currentSettings));
          websocket.send(JSON.stringify({
            event: 'sendToPropertyInspector',
            context: message.context,
            payload: currentSettings
          }));
          break;

        case 'propertyInspectorDidDisappear':
          log('Property Inspector closed');
          break;

        case 'sendToPlugin':
          log('Received from Property Inspector:', JSON.stringify(message.payload));
          break;
      }
    } catch (error) {
      log('Error processing message:', error.message);
      log(error.stack);
    }
  });

  websocket.on('error', (error) => {
    log('WebSocket error:', error.message);
  });

  websocket.on('close', () => {
    log('Disconnected from Stream Deck');
    plugin.stopPolling();
  });
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  log('Uncaught exception:', error.message);
  log(error.stack);
});

process.on('unhandledRejection', (error) => {
  log('Unhandled rejection:', error.message);
  if (error.stack) log(error.stack);
});

// Parse command line arguments
const args = process.argv.slice(2);
const params = {};
args.forEach((arg, i) => {
  if (arg.startsWith('-')) {
    params[arg.substring(1)] = args[i + 1];
  }
});

log('Command line arguments:', JSON.stringify(args));
log('Parsed parameters:', JSON.stringify(params));

// Start plugin
if (params.port && params.pluginUUID && params.registerEvent) {
  log('Starting plugin with params:', JSON.stringify(params));
  connectElgatoStreamDeckSocket(
    params.port,
    params.pluginUUID,
    params.registerEvent,
    params.info
  );
} else {
  log('ERROR: Missing required parameters');
  log('Received params:', JSON.stringify(params));
  console.error('Missing required parameters');
  process.exit(1);
}
