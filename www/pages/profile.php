<?php

require_once "../php/page.php";

class ProfilePage extends Page
{
    public function __construct()
    {
        $this->requireLogin(PageUrls::PROFILE);

        $this->drawHeader("Profil", array("/js/modernizr.js","/js/html5check.js"), array("/styles/main.css"));

        $username = $this->getUsername();
        $email = $this->getEmail();

        include "../html/profile.php";

        $this->drawFooter();
    }
}

new ProfilePage();

?>
