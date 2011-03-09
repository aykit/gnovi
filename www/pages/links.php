<?php

require_once "../php/page.php";

class UeberPage extends Page
{
    public function __construct()
    {
        $this->drawHeader("Ueber", array(), array("/styles/reset.css", "/styles/main.css", "/styles/navigation.css"), "");

        $username = $this->getUsername();
        $email = $this->getEmail();

        include "../html/about_header.php";
        include "../html/links.php";
        include "../html/thanks.php";

        $this->drawFooter();
    }
}

new UeberPage();

?>