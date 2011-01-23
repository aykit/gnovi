<?php

chdir("..");
require_once "php/page.php";

class LoginPage extends Page
{
    public function __construct()
    {
        $this->logout();
        header("Location: " . PageUrls::START);
        die();
    }
}

new LoginPage();

?>
