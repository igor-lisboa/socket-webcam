<?php
try {
    // setando variaveis
    //127.0.0.1
    $host = $_POST["ip"];
    //25003
    $port = $_POST["porta"];
    // 0 p n dar timeout
    set_time_limit(0);
    // cria socket
    $socket = socket_create(AF_INET, SOCK_STREAM, 0);
    // bind socket
    $result = socket_bind($socket, $host, $port);
    // inicia ouvir p pegar conexoes
    $result = socket_listen($socket, 3);

    // aceitar conexões de entrada
    // gerar outro socket para lidar com a comunicação
    $spawn = socket_accept($socket);
    // read client input
    $input = socket_read($spawn, 1024);
    // limpa o input
    $input = trim($input);
    echo "Mensagem do Cliente : " . $input;
    // entrada reversa do cliente e enviar de volta
    $output = strrev($input) . "\n";
    socket_write($spawn, $output, strlen($output));
    // fecha sockets
    socket_close($spawn);
    socket_close($socket);
} catch (Exception $ex) {
    echo $ex->getMessage();
}
