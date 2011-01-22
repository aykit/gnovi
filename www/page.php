<?php

error_reporting(E_ALL);

class Page
{
    protected $db = null;
    protected $dbError = "";
    protected $sessionStarted = false;

    public function __construct()
    {
    }

    protected function connectDb()
    {
        if ($this->db)
            return true;

        $this->db = new mysqli();

        if (!$this->db->real_connect("localhost", "gnovi", "2suKWnLxLBfBCZnh", "gnovi"))
        {
            $this->dbError = $this->db->connect_error;
            $this->db = null;
            return false;
        }

        if (!$this->db->set_charset("utf8"))
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

    protected function login($email, $password)
    {
        $this->logout();

        $email = $this->db->real_escape_string($email);

        $result = $this->db->query("SELECT `ID`, `Name`, `Email`, `Password` FROM `Users` WHERE `Email` = '$email'");
        $row = $result->fetch_assoc();

        if (!$row || $row['Password'] != sha1($password))
            return false;

        $_SESSION['ID'] = $row['ID'];
        $_SESSION['Username'] = $row['Username'];

        return true;
    }

    protected function logout()
    {
        $this->startSession();

        unset($_SESSION['ID']);
        unset($_SESSION['Username']);
    }

    protected function drawHeader($title, $javaScripts, $styleSheets)
    {
        include "html/header.php";
    }

    protected function drawFooter()
    {
        include "html/footer.php";
    }
}

?>
