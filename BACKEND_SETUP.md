# Backend UART Setup for Raspberry Pi

This application includes a backend service that communicates with an external MCU via UART.

## Hardware Requirements

- Raspberry Pi 4 running Debian OS
- External MCU connected to UART (/dev/ttyS0)
- UART settings: 115200 baud, 8 data bits, No parity, 1 stop bit (8N1)

## Enable UART on Raspberry Pi

1. **Enable UART in raspi-config:**
   ```bash
   sudo raspi-config
   ```
   Navigate to: `Interface Options` → `Serial Port`
   - "Would you like a login shell accessible over serial?" → **No**
   - "Would you like the serial port hardware enabled?" → **Yes**

2. **Edit boot config:**
   ```bash
   sudo nano /boot/config.txt
   ```
   Add or ensure these lines are present:
   ```
   enable_uart=1
   dtoverlay=disable-bt
   ```

3. **Disable Bluetooth (uses primary UART):**
   ```bash
   sudo systemctl disable hciuart
   ```

4. **Reboot:**
   ```bash
   sudo reboot
   ```

5. **Verify UART device:**
   ```bash
   ls -l /dev/ttyS0
   ```

6. **Set permissions:**
   ```bash
   sudo usermod -a -G dialout $USER
   ```
   Log out and back in for this to take effect.

## Installation

1. **Install Node.js (if not already installed):**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

## Running the Backend

### Option 1: Using the startup script (recommended)

```bash
chmod +x start-backend.sh
./start-backend.sh
```

### Option 2: Manual start

```bash
# Compile TypeScript
npx tsc backend/uart-server.ts --outDir backend/dist --module commonjs --target es2020 --moduleResolution node --esModuleInterop

# Run the server
node backend/dist/uart-server.js
```

The backend server will:
- Listen on port 3001 for HTTP requests
- Open WebSocket connection for real-time lamp updates
- Connect to UART at /dev/ttyS0 (115200 8N1)
- Monitor for <UICV> messages from MCU

## Running Frontend and Backend Together

You need to run both the frontend and backend simultaneously:

**Terminal 1 - Backend:**
```bash
./start-backend.sh
```

**Terminal 2 - Frontend:**
```bash
./start-dashboard.sh
```

Or use a process manager like PM2:

```bash
npm install -g pm2

# Start backend
pm2 start backend/dist/uart-server.js --name uart-backend

# Start frontend
pm2 start "npm run dev" --name dashboard-frontend

# Save configuration
pm2 save

# Enable auto-start on boot
pm2 startup
```

## Communication Protocol

### Audio Playback Sequence
When "Bemondás indítása" is pressed:
1. Send `<WFS110>` to MCU
2. Wait 10ms
3. Send `<WDS1>` to MCU
4. Wait 1 second
5. Send `<WFS100>` to MCU
6. Start audio playback
7. Turn MŰSOR lamp ON

### Background Monitoring
- Continuously monitors UART for `<UICV>` message
- When detected:
  - Send `<WFS000>` to MCU
  - Send `<WDS0>` to MCU
  - Turn VÉTEL lamp ON

### Stop Sequence
When "Bemondás leállítása" is pressed:
- Stop audio playback
- Turn off all lamps (VÉTEL and MŰSOR)

## API Endpoints

- `POST /api/play` - Start audio playback sequence
- `POST /api/stop` - Stop playback and clear lamps
- `GET /api/lamps` - Get current lamp states

## WebSocket Events

- Client receives lamp state updates in real-time:
  ```json
  {
    "type": "lampUpdate",
    "lamps": {
      "vetel": false,
      "musor": true
    }
  }
  ```

## Troubleshooting

### UART not found
- Check if UART is enabled: `ls -l /dev/ttyS0`
- Run `sudo raspi-config` and verify serial settings
- Check `/boot/config.txt` for `enable_uart=1`

### Permission denied
- Add user to dialout group: `sudo usermod -a -G dialout $USER`
- Log out and back in

### Backend won't start
- Check if port 3001 is available: `lsof -i :3001`
- Check Node.js version: `node --version` (should be 18+)

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check firewall settings
- Verify WebSocket connection in browser console

### Audio doesn't play
- Check browser console for errors
- Ensure audio file is uploaded
- Verify backend received the play command
