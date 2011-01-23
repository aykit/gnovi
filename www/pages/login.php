<?php

chdir("..");
require_once "php/page.php";

class LoginPage extends Page
{
    public function draw()
    {
        $this->logout();

        $posted = $_SERVER["REQUEST_METHOD"] == "POST";

        $email = (string)@$_POST['e'];
        $password = (string)@$_POST['p'];

        if ($email != "" && $password != "")
        {
            if ($this->login($email, $password))
            {
                header("Location: " . rawurlencode(PageUrls::PROFILE));
                die();
            }
        }

        $this->drawHeader("Einloggen", array(), array());

        include "html/login.php";

        $this->drawFooter();
    }
}

$page = new LoginPage();
$page->draw();

?>
