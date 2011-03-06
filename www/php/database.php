<?php

require_once "config.php";

class Database extends mysqli
{
    public $connectError = "";
    public $connectErrorCode = 0;

    public function connect()
    {
        $this->db = new mysqli();

        $host = Config::DB_HOST;
        $user = Config::DB_USER;
        $password = Config::DB_PASSWORD;
        $database = Config::DB_DATABASE;
        if (!@$this->real_connect($host, $user, $password, $database))
        {
            $this->connectError = $this->connect_error;
            $this->connectErrorCode = $this->connect_errno;
            return false;
        }

        if (!@$this->set_charset("utf8"))
        {
            $this->connectError = $this->error;
            $this->connectErrorCode = $this->errno;
            $this->close();
            return false;
        }

        return true;
    }

    public function checkLogin($email, $password, $alreadyHashed = false)
    {
        $email = $this->escape_string($email);

        $result = $this->query("SELECT `ID`, `Name`, `Email`, `PasswordHash`, `Salt` " .
            "FROM `Users` WHERE `Email` = '$email'");
        if (!$result)
            return null;

        $row = $result->fetch_assoc();
        if (!$row)
            return null;

        $passwordHash = $alreadyHashed ? $password : sha1($password . $row['Salt']);

        return $row['PasswordHash'] == $passwordHash ? $row : null;
    }

    public function registerUser($name, $email, $passwordHash, $salt)
    {
        $name = $this->escape_string($name);
        $email = $this->escape_string($email);
        $passwordHash = $this->escape_string($passwordHash);
        $salt = $this->escape_string($salt);

        return $this->query("INSERT INTO `Users` (`Name`, `Email`, `PasswordHash`, `Salt`) " .
            "VALUES ('$name', '$email', '$passwordHash', '$salt')");
    }
}

?>
