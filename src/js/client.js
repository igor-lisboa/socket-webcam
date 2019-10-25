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
        alert('Digite um ID')
        return
    }


})

const handleLogin = async success => {
    if (success === false) {
        alert('ID já utilizado')
    } else {
        document.querySelector('button#login').disabled = true
        document.querySelector('input#id').disabled = true
        document.querySelector('video').removeAttribute("hidden");

        const configuration = {
            iceServers: [{ url: 'stun:stun2.1.google.com:19302' }]
        }

        connection = new RTCPeerConnection(configuration)

        //declara media Stream vazio
        let localStream = new MediaStream();

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