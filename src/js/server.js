const path = require('path');
const express = require('express');
const http = require('http');
const app = express();
const httpServer = http.createServer(app);
var localIpV4Address = require("local-ipv4-address");

//https://flaviocopes.com/webrtc/
const WebSocket = require('ws')
const wss = new WebSocket.Server({ server: httpServer });
const users = {}

const sendTo = (ws, message) => {
    ws.send(JSON.stringify(message))
}

localIpV4Address().then(function(ipAddress) {
    console.log("IP do servidor : " + ipAddress);

    const PORT = process.env.PORT || 3000;


    wss.on('connection', ws => {
        console.log('Usuário conectado')

        ws.on('message', message => {
            let data = null

            try {
                data = JSON.parse(message)
            } catch (error) {
                console.error('Invalid JSON', error)
                data = {}
            }


            switch (data.type) {
                case 'login':
                    console.log('Usuário logado', data.username)
                    if (users[data.username]) {
                        sendTo(ws, { type: 'login', success: false })
                    } else {
                        users[data.username] = ws
                        ws.username = data.username
                        sendTo(ws, { type: 'login', success: true })
                    }
                    break
                case 'offer':
                    console.log('Enviando oferta para: ', data.otherUsername)
                    if (users[data.otherUsername] != null) {
                        ws.otherUsername = data.otherUsername
                        sendTo(users[data.otherUsername], {
                            type: 'offer',
                            offer: data.offer,
                            username: ws.username
                        })
                    }
                    break
                case 'answer':
                    console.log('Enviando resposta para: ', data.otherUsername)
                    if (users[data.otherUsername] != null) {
                        ws.otherUsername = data.otherUsername
                        sendTo(users[data.otherUsername], {
                            type: 'answer',
                            answer: data.answer
                        })
                    }
                    break
                case 'candidate':
                    console.log('Enviando candidato para:', data.otherUsername)
                    if (users[data.otherUsername] != null) {
                        sendTo(users[data.otherUsername], {
                            type: 'candidate',
                            candidate: data.candidate
                        })
                    }
                    break
                case 'close':
                    console.log('Desconectando de', data.otherUsername)
                    users[data.otherUsername].otherUsername = null

                    if (users[data.otherUsername] != null) {
                        sendTo(users[data.otherUsername], { type: 'close' })
                    }

                    break

                default:
                    sendTo(ws, {
                        type: 'error',
                        message: 'Comando não encontrado: ' + data.type
                    })

                    break
            }
        })

        ws.on('close', () => {
            if (ws.username) {
                delete users[ws.username]

                if (ws.otherUsername) {
                    console.log('Desconectando de ', ws.otherUsername)
                    users[ws.otherUsername].otherUsername = null

                    if (users[ws.otherUsername] != null) {
                        sendTo(users[ws.otherUsername], { type: 'close' })
                    }
                }
            }
        })
    });

    // HTTP rotas
    app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, '../../index.html')));
    app.get('/streamer', (req, res) => res.sendFile(path.resolve(__dirname, '../html/streamer.html')));
    app.get('/cliente', (req, res) => res.sendFile(path.resolve(__dirname, '../html/cliente.html')));
    app.get('/client.js', (req, res) => res.sendFile(path.resolve(__dirname, './client.js')));
    app.get('/streamer.js', (req, res) => res.sendFile(path.resolve(__dirname, './streamer.js')));
    httpServer.listen(PORT, () => console.log(`HTTP server listening at http://${ipAddress}:${PORT}`));
});