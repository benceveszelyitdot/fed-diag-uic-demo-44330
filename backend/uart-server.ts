import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { SerialPort } from 'serialport';
import { createServer } from 'http';
import { exec } from "child_process";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// UART Configuration
const UART_PORT = '/dev/ttyAMA0';
const UART_BAUDRATE = 115200;

let serialPort: SerialPort;
let lampStates = {
  vetel: false,
  musor: false
};

let sensorData = {
  waterLevel: 1, // 1, 2, or 3 (representing 1/3, 2/3, 3/3) - default is 1 (full)
  temp1: 0,      // Temperature in celsius (will be divided by 10 from MCU response)
  temp2: 0       // Temperature in celsius (will be divided by 10 from MCU response)
};

// Initialize UART connection
function initUART() {
  try {
    serialPort = new SerialPort({
      path: UART_PORT,
      baudRate: UART_BAUDRATE,
      dataBits: 8,
      parity: 'none',
      stopBits: 1
    });

    serialPort.on('open', () => {
      console.log('UART connection opened on', UART_PORT);
    });

    // Monitor incoming data from MCU
    serialPort.on('data', (data: Buffer) => {
      const message = data.toString();
      console.log('Received from MCU:', message);
      
      // Handle UICV message
      if (message.includes('<UICV>')) {
        console.log('UICV detected - triggering reception mode');
        handleUICV();
      }
      
      // Parse RDI response: <RDI:xyzw>
      const rdiMatch = message.match(/<RDI:(\d)(\d)(\d)(\d)>/);
      if (rdiMatch) {
        const x = parseInt(rdiMatch[1]);
        const y = parseInt(rdiMatch[2]);
        // x=1 means at low 1/3 state (low alert)
        // y=1 means above 2/3, y=0 means below 2/3
        if (x === 1) {
          sensorData.waterLevel = 1; // Low 1/3 alert
        } else if (y === 1) {
          sensorData.waterLevel = 3; // Above 2/3 (full)
        } else {
          sensorData.waterLevel = 2; // Between 1/3 and 2/3
        }
        console.log('Water level updated:', sensorData.waterLevel, `(x=${x}, y=${y})`);
        broadcastSensorData();
      }
      
      // Parse RTT response: <RTT:xxxx,yyyy>
      const rttMatch = message.match(/<RTT:(\d+),(\d+)>/);
      if (rttMatch) {
        sensorData.temp1 = parseInt(rttMatch[1]) / 10;
        sensorData.temp2 = parseInt(rttMatch[2]) / 10;
        console.log('Temperatures updated:', sensorData.temp1, sensorData.temp2);
        broadcastSensorData();
      }
    });

    serialPort.on('error', (err) => {
      console.error('UART error:', err);
    });

  } catch (error) {
    console.error('Failed to initialize UART:', error);
  }
}

// Send command to MCU via UART
function sendToMCU(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!serialPort || !serialPort.isOpen) {
      console.error('UART port not open');
      reject(new Error('UART port not open'));
      return;
    }

    serialPort.write(command, (err) => {
      if (err) {
        console.error('Error writing to UART:', err);
        reject(err);
      } else {
        console.log('Sent to MCU:', command);
        resolve();
      }
    });
  });
}

// Delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Handle UICV message from MCU
async function handleUICV() {
  try {
    await sendToMCU('<WFS000>');
    await sendToMCU('<WDS0>');
    updateLampState('vetel', true);
  } catch (error) {
    console.error('Error handling UICV:', error);
  }
}

// Update lamp state and broadcast to all clients
function updateLampState(lamp: 'vetel' | 'musor', state: boolean) {
  lampStates[lamp] = state;
  broadcastLampStates();
}

// Broadcast lamp states to all WebSocket clients
function broadcastLampStates() {
  const message = JSON.stringify({
    type: 'lampUpdate',
    lamps: lampStates
  });

  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN state
      client.send(message);
    }
  });
}

// Broadcast sensor data to all WebSocket clients
function broadcastSensorData() {
  const message = JSON.stringify({
    type: 'sensorUpdate',
    sensors: sensorData
  });

  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN state
      client.send(message);
    }
  });
}

// Periodic polling of MCU for sensor data (every 10 seconds)
function startSensorPolling() {
  setInterval(async () => {
    try {
      await sendToMCU('<RDI>');
      await delay(50);
      await sendToMCU('<RTT>');
    } catch (error) {
      console.error('Error polling sensors:', error);
    }
  }, 10000); // 10 seconds
}

// API Endpoints

// Play audio sequence
app.post('/api/play', async (req, res) => {
  try {
    console.log('Starting audio play sequence');
    
    // Turn MŰSOR lamp ON
    updateLampState('musor', true);
    
    // Send sequence to MCU
    await sendToMCU('<WFS110>');
    await delay(10);
    await sendToMCU('<WDS1>');
    await delay(1000);
    await sendToMCU('<WFS100>');

    exec("/opt/infopix/start.sh", (error, stdout, stderr) => {
      if (error) {
        console.error(`PLAY Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`PLAY Stderr: ${stderr}`);
        return;
      }
      console.log(`PLAY Output:\n${stdout}`);
    });
    
    res.json({ success: true, message: 'Audio sequence started' });
  } catch (error) {
    console.error('Error in play sequence:', error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Stop audio and clear all lamps
app.post('/api/stop', async (req, res) => {
  try {
    console.log('Stopping audio and clearing lamps');
    
    // Send stop commands to MCU
    await sendToMCU('<WFS000>');
    await delay(10);
    await sendToMCU('<WDS0>');
    
    // Turn off all lamps
    updateLampState('vetel', false);
    updateLampState('musor', false);
    
    exec("/opt/infopix/stop.sh", (error, stdout, stderr) => {
      if (error) {
        console.error(`PLAY Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`PLAY Stderr: ${stderr}`);
        return;
      }
      console.log(`PLAY Output:\n${stdout}`);
    });

    res.json({ success: true, message: 'Stopped and cleared lamps' });
  } catch (error) {
    console.error('Error in stop sequence:', error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Get current lamp states
app.get('/api/lamps', (req, res) => {
  res.json(lampStates);
});

// Get current sensor data
app.get('/api/sensors', (req, res) => {
  res.json(sensorData);
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  // Send current lamp states and sensor data to new client
  ws.send(JSON.stringify({
    type: 'lampUpdate',
    lamps: lampStates
  }));
  
  ws.send(JSON.stringify({
    type: 'sensorUpdate',
    sensors: sensorData
  }));

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Start server
const PORT = 3001;

server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
  initUART();
  startSensorPolling();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  if (serialPort && serialPort.isOpen) {
    serialPort.close();
  }
  server.close();
  process.exit(0);
});
