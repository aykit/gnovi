<?php

require_once "../php/page.php";

class StartPage extends Page
{
    public function __construct()
    {
        $this->startSession();

        $this->drawHeader("Hallo", array(), array());

        $username = $this->getUsername();
        $email = $this->getEmail();

        include "../html/start.php";

        $this->drawFooter();
    }
}

new StartPage();

?>
