const WS_URL = location.origin.replace(/^http/, 'ws');
const ws = new WebSocket(WS_URL)

ws.onopen = () => {
    console.log('Conectado ao servidor de sinalização')
}

ws.onerror = err => {
    console.error(err)
}

ws.onmessage = msg => {
    console.log('Mensagem recebida', msg.data)

    const data = JSON.parse(msg.data)

    switch (data.type) {
        case 'login':
            handleLogin(data.success)
            break
        case 'offer':
            handleOffer(data.offer, data.username)
            break
        case 'answer':
            handleAnswer(data.answer)
            break
        case 'candidate':
            handleCandidate(data.candidate)
            break
        case 'close':
            console.log("solicitacao de close na conexão")
            break
        default:
            break
    }
}

let connection = null
let name = null
let otherUsername = null

const sendMessage = message => {
    if (otherUsername) {
        message.otherUsername = otherUsername
    }

    ws.send(JSON.stringify(message))
}


document.querySelector('button#login').addEventListener('click', event => {
    username = document.querySelector('input#id').value

    if (username.length > 0) {
        sendMessage({
            type: 'login',
            username: username
        })
    } else {
        alert('Digite um ID!')
        return
    }


})

const handleLogin = async success => {
    if (success === false) {
        alert('ID já utilizado')
    } else {
        document.querySelector('input#id').disabled = true;
        document.querySelector('button#login').disabled = true;
        document.querySelector('video').removeAttribute("hidden");
        document.querySelector('input#envia-para').disabled = false;
        document.querySelector('button#envia').disabled = false;

        let localStream
        try {
            //recuperacao de devices
            if (navigator.mediaDevices === undefined) {
                navigator.mediaDevices = {};
                navigator.mediaDevices.getUserMedia = function(constraintObj) {
                    let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                    if (!getUserMedia) {
                        return Promise.reject(new Error('getUserMedia nao esta implementado nesse navegador'));
                    }
                    return new Promise(function(resolve, reject) {
                        getUserMedia.call(navigator, constraintObj, resolve, reject);
                    });
                }
            } else {
                navigator.mediaDevices.enumerateDevices().then(devices => {
                        // lista devices recuperados
                        devices.forEach(device => {
                            console.log(device.kind.toUpperCase(), device.label);
                        })
                    })
                    .catch(err => {
                        console.log(err.name, err.message);
                    })
            }
            const options = {
                audio: true,
                video: true
            };
            // pede acesso para acessar webcam
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                localStream = await navigator.mediaDevices.getUserMedia(options).catch(function(e) {
                    alert('navigator.mediaDevices.getUserMedia() falhou');
                    console.log('navigator.mediaDevices.getUserMedia() erro: ', e);
                });
            } else if (navigator.getUserMedia) { // Padrao
                localStream = await navigator.getUserMedia(options).catch(function(e) {
                    alert('navigator.getUserMedia() falhou');
                    console.log('navigator.getUserMedia() erro: ', e);
                });
            } else if (navigator.webkitGetUserMedia) { // WebKit-prefixado
                localStream = await navigator.webkitGetUserMedia(mediaConfig).catch(function(e) {
                    alert('navigator.webkitGetUserMedia() falhou');
                    console.log('navigator.webkitGetUserMedia() erro: ', e);
                });
            } else if (navigator.mozGetUserMedia) { // Mozilla-prefixado
                localStream = await navigator.mozGetUserMedia(mediaConfig).catch(function(e) {
                    alert('navigator.mozGetUserMedia() falhou');
                    console.log('navigator.mozGetUserMedia() erro: ', e);
                });
            }

        } catch (error) {
            alert(`${error.name}`)
            console.error(error)
        }

        document.querySelector('video').srcObject = localStream

        const configuration = {
            iceServers: [{ url: 'stun:stun2.1.google.com:19302' }]
        }

        connection = new RTCPeerConnection(configuration)

        addStream(localStream)

        connection.onaddstream = event => {
            document.querySelector('video').srcObject = event.stream
        }

        connection.onicecandidate = event => {
            if (event.candidate) {
                sendMessage({
                    type: 'candidate',
                    candidate: event.candidate
                })
            }
        }
    }
}

document.querySelector('button#envia').addEventListener('click', () => {
    const callToUsername = document.querySelector('input#envia-para').value

    if (callToUsername.length > 0) {
        otherUsername = callToUsername

        connection.createOffer(
            offer => {
                sendMessage({
                    type: 'offer',
                    offer: offer
                })

                connection.setLocalDescription(offer)
            },
            error => {
                alert('Erro ao criar uma oferta')
                console.error(error)
            }
        )
    } else {
        alert('Digite um ID')
        return
    }
})

const handleOffer = (offer, username) => {
    otherUsername = username
    connection.setRemoteDescription(new RTCSessionDescription(offer))
    connection.createAnswer(
        answer => {
            connection.setLocalDescription(answer)
            sendMessage({
                type: 'answer',
                answer: answer
            })
        },
        error => {
            alert('Erro ao criar uma resposta')
            console.error(error)
        }
    )
}

const handleAnswer = answer => {
    connection.setRemoteDescription(new RTCSessionDescription(answer))
}

const handleCandidate = candidate => {
    connection.addIceCandidate(new RTCIceCandidate(candidate))
}


function listaRemoteStreams() {
    if (connection != null) {
        var streams = connection.getRemoteStreams();
        for (var stream of streams) {
            console.log("Remote stream: " + stream.id);
        }
    }
}

function listaLocalStreams() {
    if (connection != null) {
        var streams = connection.getLocalStreams();
        for (var stream of streams) {
            console.log("Local stream: " + stream.id);
            console.log(stream);
        }
    }
}

function addStream(stream) {
    if (connection != null) {
        console.log(stream);
        console.log(connection);
        connection.addStream(stream);
        console.log(connection);
        console.log("Stream adicionada na conexão");
        listaLocalStreams();
    } else {
        alert("Houve um problema na conexão, tente novamente!");
    }
}