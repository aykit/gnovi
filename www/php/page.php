<?php

error_reporting(E_ALL);

require_once "page_urls.php";

class Page
{
    protected $db = null;
    protected $dbError = "";
    protected $sessionStarted = false;

    protected function displayDatabaseError($error)
    {
        include "html/dberror.php";
        die();
    }

    protected function connectDb()
    {
        if ($this->db)
            return true;

        $this->db = new mysqli();

        if (!@$this->db->real_connect("localhost", "gnovi", "2suKWnLxLBfBCZnh", "gnovi"))
        {
            $this->dbError = $this->db->connect_error;
            $this->db = null;
            return false;
        }

        if (!@$this->db->set_charset("utf8"))
        {
            $this->db->close();
            $this->dbError = $this->db->error;
            $this->db = null;
            return false;
        }

        return true;
    }

    protected function startSession()
    {
        if ($this->sessionStarted)
            return;

        session_start();
        $this->sessionStarted = true;
    }

    protected function isLoggedIn()
    {
        return isset($_SESSION['ID']);
    }

    protected function getUsername()
    {
        return isset($_SESSION['ID']) ? (string)$_SESSION['Username'] : false;
    }

    protected function getEmail()
    {
        return isset($_SESSION['ID']) ? (string)$_SESSION['Email'] : false;
    }

    protected function login($email, $password, $alreadyHashed = false)
    {
        $this->logout();

        if (!$this->connectDb())
        {
            $this->displayDatabaseError($this->dbError);
            return false;
        }

        $email = $this->db->escape_string($email);

        $result = $this->db->query("SELECT `ID`, `Name`, `Email`, `PasswordHash`, `Salt` " .
            "FROM `Users` WHERE `Email` = '$email'");
        $row = $result->fetch_assoc();

        if (!$row)
            return false;

        $passwordHash = $alreadyHashed ? $password : sha1($password . $row['Salt']);

        if ($row['PasswordHash'] != $passwordHash)
            return false;

        $_SESSION['ID'] = $row['ID'];
        $_SESSION['Username'] = $row['Name'];
        $_SESSION['Email'] = $row['Email'];

        return true;
    }

    protected function logout()
    {
        $this->startSession();

        unset($_SESSION['ID']);
        unset($_SESSION['Username']);
        unset($_SESSION['Email']);
    }

    protected function drawHeader($title, $javaScripts, $styleSheets)
    {
        $loggedin = $this->isLoggedIn();
        $username = $this->getUsername();
        $email = $this->getEmail();

        include "html/header.php";
    }

    protected function drawFooter()
    {
        include "html/footer.php";
    }
}

?>
