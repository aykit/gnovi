<?php

chdir("..");
require_once "php/page.php";
require_once "php/is_email.php";

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

        if ($password1 == (string)@$_SESSION['registerPasswdSafe1'] &&
            $password2 == (string)@$_SESSION['registerPasswdSafe2'])
        {
            $passwordHash = (string)@$_SESSION['registerPasswdHash'];
            $passwordMismatch = false;
        }
        else if ($password1 == $password2 && $password1 != "")
        {
            $passwordHash = sha1($password1);
            $passwordMismatch = false;
        }
        else
        {
            $passwordHash = "";
            $passwordMismatch = true;
        }

        $emailValid = is_email($email);
        $emailExists = false;

        if ($username != "" && $passwordHash != "" && $emailValid)
        {
            $emailExists = !$this->registerUser($username, $email, $passwordHash);

            if (!$emailExists)
            {
                unset($_SESSION['registerPasswdHash']);
                unset($_SESSION['registerPasswdSafe1']);
                unset($_SESSION['registerPasswdSafe2']);

                header("Location: " . rawurlencode(PageUrls::PROFILE));
                die();
            }
        }

        if ($passwordHash != "")
        {
            $passwordSafe1 = sha1(uniqid());
            $passwordSafe2 = sha1(uniqid());
        }
        else
        {
            $passwordSafe1 = "";
            $passwordSafe2 = "";
        }

        $_SESSION['registerPasswdHash'] = $passwordHash;
        $_SESSION['registerPasswdSafe1'] = $passwordSafe1;
        $_SESSION['registerPasswdSafe2'] = $passwordSafe2;

        $this->drawHeader("Register", array(), array());

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
