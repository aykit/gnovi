<?php

require_once "../php/page.php";

class UeberPage extends Page
{
    public function __construct()
    {
        $this->drawHeader("Ueber", array(), array("/styles/reset.css", "/styles/main.css", 
            "/styles/navigation.css"));

        $username = $this->getUsername();
        $email = $this->getEmail();

        include "../html/about_header.php";
        include "../html/manual.php";

        $this->drawFooter();
    }
}

new UeberPage();

?>