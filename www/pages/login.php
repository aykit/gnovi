<?php

chdir("..");
require_once "php/page.php";

class LoginPage extends Page
{
    public function __construct()
    {
        $this->startSession();

        if ($this->isLoggedIn())
        {
            header("Location: " . PageUrls::PROFILE);
            die();
        }

        $posted = $_SERVER["REQUEST_METHOD"] == "POST";

        $email = (string)@$_POST['e'];
        $password = (string)@$_POST['p'];

        if ($email != "" && $password != "")
        {
            if ($this->login($email, $password))
            {
                header("Location: " . PageUrls::PROFILE);
                die();
            }
        }

        $this->drawHeader("Einloggen", array(), array());

        include "html/login.php";

        $this->drawFooter();
    }
}

new LoginPage();

?>
