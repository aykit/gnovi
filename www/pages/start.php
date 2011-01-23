<?php

chdir("..");
require_once "php/page.php";

class StartPage extends Page
{
    public function draw()
    {
        $this->startSession();

        $this->drawHeader("Hallo", array(),
            array("styles/input.css", "styles/font.css", "styles/navigation.css", "styles/reset.css"));

        $username = $this->getUsername();
        $email = $this->getEmail();

        print("<p>Hallo</p>");

        $this->drawFooter();
    }
}

$page = new StartPage();
$page->draw();

?>
