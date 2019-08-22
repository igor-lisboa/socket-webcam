const path = require('path');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const httpServer = http.createServer(app);
var localIpV4Address = require("local-ipv4-address");

localIpV4Address().then(function (ipAddress) {
    console.log("Meu IP é: " + ipAddress);


    const PORT = process.env.PORT || 3000;

    const wsServer = new WebSocket.Server({ server: httpServer }, () => console.log(`WS server is listening at ws://${ipAddress}:${WS_PORT}`));

    // array of connected websocket clients
    let connectedClients = [];

    wsServer.on('connection', (ws, req) => {
        console.log('Connected');
        // add new connected client
        connectedClients.push(ws);
        // listen for messages from the streamer, the clients will not send anything so we don't need to filter
        ws.on('message', data => {
            // envia o frame em base64 para cada cliente conectado
            connectedClients.forEach((ws, i) => {
                if (ws.readyState === ws.OPEN) { // verifica se ainda esta conectado
                    ws.send(data); // send
                } else { // se nao esta conectado remove do array de ws conectados
                    connectedClients.splice(i, 1);
                }
            });
        });
    });

    // HTTP rotas
    app.get('/client', (req, res) => res.sendFile(path.resolve(__dirname, './client.html')));
    app.get('/streamer', (req, res) => res.sendFile(path.resolve(__dirname, './streamer.html')));
    app.get('/', (req, res) => {
        // response mostrado em tela
        res.send(`
        <a href="streamer">Streamer</a><br>
        <a href="client">Client</a>
    `);
    });
    httpServer.listen(PORT, () => console.log(`HTTP server listening at http://${ipAddress}:${PORT}`));
});