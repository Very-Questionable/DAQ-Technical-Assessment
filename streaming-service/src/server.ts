import net from 'net';
import { WebSocket, WebSocketServer } from 'ws';
import fs from 'fs'
import { privateEncrypt } from 'crypto';
const TCP_PORT = parseInt(process.env.TCP_PORT || '12000', 10);

const tcpServer = net.createServer();
const websocketServer = new WebSocketServer({ port: 8080 });

interface TemperatureTimestamp {
    battery_temperature: number;
    timestamp: number;
}

let incident: TemperatureTimestamp[] = [];

tcpServer.on('connection', (socket) => {
    console.log('TCP client connected');
    
    socket.on('data', (msg) => {
        console.log(msg.toString());

        // HINT: what happens if the JSON in the received message is formatted incorrectly?
        // HINT: see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch
        try {
            let currJSON = JSON.parse(msg.toString());
            checkIncident(currJSON);
        } catch (err) {
            console.error(err)
        }

        websocketServer.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(msg.toString());
            }
          });
    });

    socket.on('end', () => {
        console.log('Closing connection with the TCP client');
    });
    
    socket.on('error', (err) => {
        console.log('TCP client error: ', err);
    });
});

websocketServer.on('listening', () => console.log('Websocket server started'));

websocketServer.on('connection', async (ws: WebSocket) => {
    console.log('Frontend websocket client connected to websocket server');
    ws.on('error', console.error);  
});

tcpServer.listen(TCP_PORT, () => {
    console.log(`TCP server listening on port ${TCP_PORT}`);
});

/**
 * Updates the current status of potential incidents which are stored in a queue
 * @param src current temperature and timestamp
 * @returns void
 */
function checkIncident(src: TemperatureTimestamp) {
    if (src.battery_temperature > 20 && src.battery_temperature < 80) {
        return;
    }
    
    incident.push(src)
    
    // ensures that no 2 timestamps differ by 5 seconds
    if (src.timestamp - incident[0].timestamp > 5000) {
        incident.shift()
        return
    }

    // resets the incident queue if an 3 or more incidents have occured
    if (incident.length === 3) {
        fs.writeFile('incidents.log', src.timestamp.toString() + '\n', { flag: 'a+' }, err => {
            console.error(err)
        });
        incident = []
    }
}