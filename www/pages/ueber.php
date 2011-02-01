<?php

require_once "../php/page.php";

class UeberPage extends Page
{
    public function __construct()
    {
        $this->drawHeader("Ueber", array(), array("/styles/reset.css", "/styles/main.css", "/styles/navigation.css"));

        $username = $this->getUsername();
        $email = $this->getEmail();

        include "../html/ueber_header.php";
        include "../html/ueber.php";

        $this->drawFooter();
    }
}

new UeberPage();

?>