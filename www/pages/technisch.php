<?php

require_once "../php/page.php";

class UeberPage extends Page
{
    public function __construct()
    {
        $this->drawHeader("Ueber", array("/js/modernizr.js","/js/html5check.js"), array("/styles/reset.css", "/styles/main.css", 
            "/styles/navigation.css"));

        $username = $this->getUsername();
        $email = $this->getEmail();

        include "../html/ueber_header.php";
        include "../html/anleitung.php";

        $this->drawFooter();
    }
}

new UeberPage();

?>