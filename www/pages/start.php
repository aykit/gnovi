<?php

require_once "../php/page.php";

class StartPage extends Page
{
    public function __construct()
    {
        $this->drawHeader("gnovi", array(), array("/styles/main.css"), "");

        $username = $this->getUsername();
        $email = $this->getEmail();

        include "../html/start.php";
        include "../html/thanks.php";

        $this->drawFooter();
    }
}

new StartPage();

?>
