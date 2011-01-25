<?php

require_once "../php/page.php";
require_once "../php/is_email.php";

class RegisterPage extends Page
{
    public function __construct()
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
            $salt = (string)@$_SESSION['registerSalt'];
            $passwordHash = (string)@$_SESSION['registerPasswdHash'];
            $passwordMismatch = false;
        }
        else if ($password1 == $password2 && $password1 != "")
        {
            $salt = sha1(uniqid("", true));
            $passwordHash = sha1($password1 . $salt);
            $passwordMismatch = false;
        }
        else
        {
            $salt = "";
            $passwordHash = "";
            $passwordMismatch = true;
        }

        $emailValid = is_email($email);
        $emailExists = false;

        if ($username != "" && $passwordHash != "" && $emailValid)
        {
            $this->connectDb();
            if (!$this->db->registerUser($username, $email, $passwordHash, $salt))
            {
                if ($this->db->errno != 1062) // ER_DUP_ENTRY
                    $this->exitWithDatabaseError();

                $emailExists = true;
            }

            if (!$emailExists)
            {
                unset($_SESSION['registerSalt']);
                unset($_SESSION['registerPasswdHash']);
                unset($_SESSION['registerPasswdSafe1']);
                unset($_SESSION['registerPasswdSafe2']);

                $this->login($email, $passwordHash, true);

                header("Location: " . PageUrls::PROFILE);
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

        $_SESSION['registerSalt'] = $salt;
        $_SESSION['registerPasswdHash'] = $passwordHash;
        $_SESSION['registerPasswdSafe1'] = $passwordSafe1;
        $_SESSION['registerPasswdSafe2'] = $passwordSafe2;

        $this->drawHeader("Registrieren", array(), array());

        include "../html/register.php";

        $this->drawFooter();
    }
}

new RegisterPage();

?>
