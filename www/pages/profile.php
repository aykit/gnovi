<?php

chdir("..");
require_once "php/page.php";

class ProfilePage extends Page
{
    public function draw()
    {
        $this->startSession();

        if (!$this->isLoggedIn())
        {
            header("Location: " . PageUrls::START);   
            die();     
        }

        $this->drawHeader("Profil", array(),
            array("styles/input.css", "styles/font.css", "styles/navigation.css", "styles/reset.css"));

        $username = $this->getUsername();
        $email = $this->getEmail();

        include "html/profile.php";

        $this->drawFooter();
    }
}

$page = new ProfilePage();
$page->draw();

?>
