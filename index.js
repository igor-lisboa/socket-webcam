const path = require('path');
const express = require('express');
const http = require('http');
const app = express();
const httpServer = http.createServer(app);
var localIpV4Address = require("local-ipv4-address");

localIpV4Address().then(function(ipAddress) {
    console.log("IP do servidor : " + ipAddress);

    const PORT = process.env.PORT || 3000;

    // HTTP rotas
    app.get('/client', (req, res) => res.sendFile(path.resolve(__dirname, './src/html/client.html')));
    app.get('/streamer', (req, res) => res.sendFile(path.resolve(__dirname, './src/html/streamer.html')));
    app.get('/', (req, res) => {
        // response mostrado em tela
        res.send(`
        <a href="http://localhost:3000/streamer">Streamer</a><br>
        <a href="client">Client</a>
    `);
    });
    httpServer.listen(PORT, () => console.log(`HTTP server listening at http://${ipAddress}:${PORT}`));
});