<?php
try {
    //127.0.0.1
    $host = $_POST["ip"];
    //25003
    $port = $_POST["porta"];
    $message = "Ola";
    echo "Mensagem para o servidor :" . $message;
    // cria socket
    $socket = socket_create(AF_INET, SOCK_STREAM, 0);
    // conecta ao servidor
    $result = socket_connect($socket, $host, $port);
    // enviar string para o servidor
    socket_write($socket, $message, strlen($message));
    // obter resposta do servidor
    $result = socket_read($socket, 1024);
    echo "Reply From Server :" . $result;
    // fecha socket
    socket_close($socket);
} catch (Exception $ex) {
    echo $ex->getMessage();
}
