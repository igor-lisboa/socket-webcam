<?php
date_default_timezone_set('America/Sao_Paulo');
$time = date("H");
if ($time < "12") {
    $ola = "Bom dia";
} elseif ($time >= "12" && $time < "18") {
    $ola = "Boa tarde";
} else {
    $ola = "Boa noite";
}
function form_exec($titulo, $action)
{
    $form = "<form method='POST' action='" . $action . "'>";
    $form .= "<fieldset>";
    $form .= "<legend>" . $titulo . "</legend>";
    $form .= "<input required placeholder='IP' name='ip'/>";
    $form .= "<input required placeholder='PORTA' name='porta'/>";
    $form .= "<button type='submit'>Inicia</button>";
    $form .= "</fieldset>";
    $form .= "</form>";
    return $form;
}
$ip = getHostByName(php_uname('n'));
$html = "<h1>" . $ip . " " . $ola . "</h1>";
$html .= "<p>Inicie primeiro o lado Servidor, depois o Cliente.</p>";
$html .= form_exec("Servidor", "src/server.php");
$html .= form_exec("Cliente", "src/client.php");
echo $html;
