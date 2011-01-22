<?php

require_once "page.php";
require_once "is_email.php";

class RegisterPage extends Page
{
    public function draw()
    {
        $this->logout();

        $posted = $_SERVER["REQUEST_METHOD"] == "POST";

        $username = (string)@$_POST['u'];
        $email = (string)@$_POST['e'];
        $password1 = (string)@$_POST['p1'];
        $password2 = (string)@$_POST['p2'];

        if ($password1 == $password2 && $password1 != "")
        {
            if ($password1 == (string)@$_SESSION['registerPasswdSafe'])
                $passwordHash = (string)@$_SESSION['registerPasswdHash'];
            else
                $passwordHash = sha1($password1);

            $passwordSafe = sha1(uniqid());
        }
        else
        {
            $passwordHash = "";
            $passwordSafe = "";
        }

        $_SESSION['registerPasswdHash'] = $passwordHash;
        $_SESSION['registerPasswdSafe'] = $passwordSafe;

        $emailValid = is_email($email);
        $emailExists = false;

        if ($username != "" && $passwordHash != "" && $emailValid)
        {
            $emailExists = !$this->registerUser($username, $email, $passwordHash);

            if (!$emailExists)
            {
                header("Location: user.php");
                die();
            }
        }

        $this->drawHeader("Register",
            array("mootools.js"),
            array());

        include "html/register.php";

        $this->drawFooter();
    }

    protected function registerUser($name, $email, $passwordHash)
    {
        if (!$this->connectDb())
        {
            $this->displayDatabaseError($this->dbError);
            return false;
        }

        $name = $this->db->escape_string($name);
        $email = $this->db->escape_string($email);
        $passwordHash = $this->db->escape_string($passwordHash);

        if ($this->db->query("INSERT INTO `Users` (`Name`, `Email`, `Password`) " . 
            "VALUES ('$name', '$email', '$passwordHash')"))
            return true;

        if ($this->db->errno != 1062) // ER_DUP_ENTRY
            $this->displayDatabaseError($this->db->error);

        return false;
    }
}

$page = new RegisterPage();
$page->draw();

?>
