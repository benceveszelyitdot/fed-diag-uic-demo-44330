# Raspberry Pi Setup Guide

This monitoring dashboard is fully compatible with Raspberry Pi running Debian Linux.

## Prerequisites

1. **Node.js and npm** (version 18 or higher recommended)
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Git** (if cloning from repository)
   ```bash
   sudo apt-get update
   sudo apt-get install git
   ```

## Installation Steps

1. **Clone or copy the project to your Raspberry Pi**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the application**
   ```bash
   npm run build
   ```

4. **Run in development mode**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:8080`

5. **Access from other devices**
   - Find your Raspberry Pi's IP address: `hostname -I`
   - Access from other devices on your network: `http://<raspberry-pi-ip>:8080`

## Running as a Service (Auto-start on boot)

To make the app start automatically when your Raspberry Pi boots:

1. **Use the provided startup script**
   ```bash
   chmod +x start-dashboard.sh
   ./start-dashboard.sh
   ```

2. **Or create a systemd service** (create `/etc/systemd/system/dashboard.service`):
   ```ini
   [Unit]
   Description=Monitoring Dashboard
   After=network.target

   [Service]
   Type=simple
   User=pi
   WorkingDirectory=/home/pi/<project-directory>
   ExecStart=/usr/bin/npm run dev
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   ```

3. **Enable and start the service**
   ```bash
   sudo systemctl enable dashboard.service
   sudo systemctl start dashboard.service
   ```

## Production Deployment

For production, use a proper web server:

1. **Install nginx**
   ```bash
   sudo apt-get install nginx
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Copy build files to nginx**
   ```bash
   sudo cp -r dist/* /var/www/html/
   ```

4. **Access the app**
   - Visit `http://<raspberry-pi-ip>` in your browser

## Performance Tips

- **Lightweight browser**: Use Chromium instead of heavy browsers
- **Memory**: Ensure at least 1GB RAM available for Node.js
- **Swap**: Consider increasing swap space if using Raspberry Pi Zero
- **Overclocking**: Can improve performance on older Pi models (optional)

## Troubleshooting

- **Port already in use**: Change port in `vite.config.ts`
- **Memory errors**: Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=512 npm run dev`
- **Permission denied**: Run with `sudo` or fix permissions
- **Audio not playing**: Ensure audio drivers are installed and working

## Connecting Real Sensors

To integrate actual temperature sensors and water level sensors:
- Use GPIO pins with appropriate libraries (e.g., `onoff`, `rpi-gpio`)
- Consider setting up a backend service to read sensor data
- Update the React app to fetch data from the sensor service
