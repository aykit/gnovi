<?php

require_once "../php/page.php";

class LoginPage extends Page
{
    public function __construct()
    {
        if ($this->isLoggedIn())
            $this->redirectToDestination();

        $posted = $_SERVER["REQUEST_METHOD"] == "POST";

        $email = (string)@$_POST['e'];
        $password = (string)@$_POST['p'];

        if ($email != "" && $password != "")
        {
            if ($this->login($email, $password))
                $this->redirectToDestination();
        }

        $this->drawHeader("Einloggen", array(), array("/styles/main.css"));

        include "../html/login.php";

        $this->drawFooter();
    }

    protected function redirectToDestination()
    {
        $requestUri = $_SERVER["REQUEST_URI"];
        $loginPath = PageUrls::LOGIN;
        $path = strncmp($loginPath, $requestUri, strlen($loginPath)) == 0 ?
            substr($requestUri, strlen($loginPath)) : "";
        if ($path == "")
            $path = PageUrls::PROFILE;

        header("Location: " . $path);
        die();
    }
}

new LoginPage();

?>
