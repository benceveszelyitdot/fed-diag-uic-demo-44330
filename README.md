# Monitoring Dashboard with UART Backend

A full-stack monitoring and control system designed for Raspberry Pi, featuring real-time sensor monitoring, audio playback control, and MCU communication via UART.

## Project Overview

This application is a comprehensive monitoring dashboard that bridges a React-based frontend with a hardware MCU (Microcontroller Unit) through a Node.js backend server. It provides real-time monitoring of environmental sensors and controls audio playback with visual lamp indicators.

### Key Features

- **Real-time Sensor Monitoring**: Displays water level (1/3, 2/3, 3/3) and dual temperature sensors
- **Audio Playback Control**: Upload and play audio files with synchronized lamp indicators
- **UART Communication**: Direct hardware communication with external MCU at 115200 baud
- **WebSocket Updates**: Live updates for sensor data and lamp states
- **Historical Data Visualization**: Charts showing temperature and water level trends
- **Responsive Design**: Modern UI built with React, Tailwind CSS, and shadcn/ui components

## Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: shadcn/ui component library
- **State Management**: React hooks and WebSocket connections
- **Routing**: React Router for navigation
- **Charts**: Recharts for data visualization

### Backend (Node.js + Express)
- **Server**: Express.js HTTP server with WebSocket support
- **UART Communication**: SerialPort library for hardware communication
- **Real-time Updates**: WebSocket Server (ws) for pushing updates to clients
- **Protocol**: Custom message protocol for MCU communication

## How It Works

### Backend Communication Flow

1. **UART Initialization**
   - Opens serial connection to `/dev/ttyS0` at 115200 baud (8N1)
   - Continuously monitors incoming data from MCU
   - Parses structured messages using regex patterns

2. **Sensor Data Polling** (Every 10 seconds)
   - Sends `<RDI>` to query water level
   - Sends `<RTT>` to query temperatures
   - Parses responses and broadcasts to connected clients

3. **Message Protocol**
   - **Water Level Query**: `<RDI>` → Response: `<RDI:xyzw>`
     - `x=1`: Water at 1/3 (low level alert)
     - `x=0`: Water at 2/3 or above
   - **Temperature Query**: `<RTT>` → Response: `<RTT:xxxx,yyyy>`
     - `xxxx`: Temperature 1 in decidegrees (e.g., 256 = 25.6°C)
     - `yyyy`: Temperature 2 in decidegrees (e.g., 178 = 17.8°C)
   - **Reception Signal**: `<UICV>` (MCU-initiated)
     - Triggers automatic lamp control sequence

4. **Audio Playback Sequence**
   - User initiates playback via `/api/play` endpoint
   - Backend sends MCU command sequence:
     1. `<WFS110>` (10ms delay)
     2. `<WDS1>` (1s delay)
     3. `<WFS100>`
   - Frontend plays audio file locally
   - MŰSOR lamp turns ON via WebSocket

5. **Reception Mode** (Automatic)
   - MCU sends `<UICV>` message
   - Backend responds with:
     1. `<WFS000>`
     2. `<WDS0>`
   - VÉTEL lamp turns ON via WebSocket

6. **WebSocket Broadcasting**
   - All sensor updates broadcast to connected clients
   - Lamp state changes pushed in real-time
   - Clients receive structured JSON messages

### Frontend Components

- **Index Page**: Main dashboard with all monitoring widgets
- **AudioPlayer**: Upload and control audio playback, display lamp indicators
- **TemperatureGauge**: Visual gauge for temperature readings
- **WaterLevelIndicator**: Tank visualization with 1/3, 2/3, 3/3 levels
- **HistoricalChart**: Time-series data visualization
- **NavLink**: Navigation between pages

### WebSocket Message Format

```json
{
  "type": "sensorUpdate",
  "sensors": {
    "waterLevel": 2,
    "temp1": 25.6,
    "temp2": 17.8
  }
}
```

```json
{
  "type": "lampUpdate",
  "lamps": {
    "vetel": false,
    "musor": true
  }
}
```

## Project Info

**URL**: https://lovable.dev/projects/5f33ecdd-828f-40bf-a66d-02f2cbf2f5ed

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/5f33ecdd-828f-40bf-a66d-02f2cbf2f5ed) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/5f33ecdd-828f-40bf-a66d-02f2cbf2f5ed) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
