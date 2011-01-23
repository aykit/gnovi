<?php

chdir("..");
require_once "php/page.php";

class StartPage extends Page
{
    public function __construct()
    {
        $this->startSession();

        $this->drawHeader("Hallo", array(), array());

        $username = $this->getUsername();
        $email = $this->getEmail();

        print("<p>Hallo</p>");

        $this->drawFooter();
    }
}

new StartPage();

?>
