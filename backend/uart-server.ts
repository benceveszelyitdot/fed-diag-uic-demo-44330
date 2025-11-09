import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { SerialPort } from 'serialport';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// UART Configuration
const UART_PORT = '/dev/ttyS0';
const UART_BAUDRATE = 115200;

let serialPort: SerialPort;
let lampStates = {
  vetel: false,
  musor: false
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

    // Monitor incoming data for <UICV> message
    serialPort.on('data', (data: Buffer) => {
      const message = data.toString();
      console.log('Received from MCU:', message);
      
      if (message.includes('<UICV>')) {
        console.log('UICV detected - triggering reception mode');
        handleUICV();
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
    
    // Turn off all lamps
    updateLampState('vetel', false);
    updateLampState('musor', false);
    
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

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  // Send current lamp states to new client
  ws.send(JSON.stringify({
    type: 'lampUpdate',
    lamps: lampStates
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
