<?php

error_reporting(E_ALL);

require_once "page_urls.php";
require_once "database.php";

class Page
{
    protected $db = null;

    protected function exitWithDatabaseError()
    {
        $this->exitWithCustomDatabaseError($this->db->error);
    }

    protected function exitWithCustomDatabaseError($error)
    {
        include "../html/dberror.php";
        exit();
    }

    protected function requireDb()
    {
        if ($this->db)
            return;

        $this->db = new Database();

        if (!$this->db->connect())
            $this->exitWithCustomDatabaseError($this->db->connectError);
    }

    protected function startSession()
    {
        if (session_id() == "")
            session_start();
    }

    protected function requireLogin()
    {
        $this->startSession();

        if ($this->isLoggedIn())
            return;

        $pathAfterLogin = $_SERVER["REQUEST_URI"];

        if ($pathAfterLogin != "" && $pathAfterLogin[0] != "/")
            $pathAfterLogin = "";

        header("Location: " . PageUrls::LOGIN_FOR . "$pathAfterLogin");
        die();
    }

    protected function isLoggedIn()
    {
        $this->startSession();
        return isset($_SESSION['ID']);
    }

    protected function getUsername()
    {
        $this->startSession();
        return isset($_SESSION['ID']) ? (string)$_SESSION['Username'] : false;
    }

    protected function getEmail()
    {
        $this->startSession();
        return isset($_SESSION['ID']) ? (string)$_SESSION['Email'] : false;
    }

    protected function login($email, $password, $alreadyHashed = false)
    {
        $this->logout();
        $this->requireDb();

        $userInfo = $this->db->checkLogin($email, $password, $alreadyHashed);

        if ($this->db->errno != 0)
            $this->exitWithDatabaseError();

        if (!$userInfo)
            return false;

        $_SESSION['ID'] = $userInfo['ID'];
        $_SESSION['Username'] = $userInfo['Name'];
        $_SESSION['Email'] = $userInfo['Email'];
        return true;
    }

    protected function logout()
    {
        $this->startSession();

        unset($_SESSION['ID']);
        unset($_SESSION['Username']);
        unset($_SESSION['Email']);
    }

    protected function drawHeader($title, $javaScripts, $styleSheets, $onload)
    {
        $this->startSession();

        $loggedin = $this->isLoggedIn();
        $username = $this->getUsername();
        $email = $this->getEmail();

        include "../html/header.php";
    }

    protected function drawFooter()
    {
        include "../html/footer.php";
    }
}

?>
