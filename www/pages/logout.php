<?php

chdir("..");
require_once "php/page.php";

class LoginPage extends Page
{
    public function draw()
    {
        $this->logout();
        header("Location: " . PageUrls::START);
        die();
    }
}

$page = new LoginPage();
$page->draw();

?>
