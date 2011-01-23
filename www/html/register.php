    <form action="<?=htmlspecialchars($_SERVER["REQUEST_URI"])?>" method="post">
      <p>
        <label>Name:</label>
        <input id="username" type="text" value="<?=htmlspecialchars($username)?>" required name="u">
      </p>
      <p>
        <label>Email:</label>
        <input id="email" type="email" value="<?=htmlspecialchars($email)?>" required name="e">
      </p>
      <p>
        <label>Passwort:</label>
        <input id="password1" type="password" value="<?=htmlspecialchars($passwordSafe1)?>" required name="p1">
      </p>
      <p>
        <label>Passwort wiederholen:</label>
        <input id="password2" type="password" value="<?=htmlspecialchars($passwordSafe2)?>" required
          onforminput="setCustomValidity(value != password1.value ? 'Passwörter sind nicht gleich.' : '')" name="p2">
      </p>
      <input type="submit" value="Registrieren">
    </form>
<?php if ($posted) { ?>
<?php if ($password1 == "" || $password2 == "") { ?>
    <p>Passwort eingeben!</p>
<?php } else if ($passwordMismatch) { ?>
    <p>Passwörter sind nicht gleich.</p>
<?php } ?>
<?php if ($username == "") { ?>
    <p>Name eingeben!</p>
<?php } ?>
<?php if ($email == "") { ?>
    <p>Email eingeben!</p>
<?php } else if (!$emailValid) { ?>
    <p>Email ungültig.</p>
<?php } else if ($emailExists) { ?>
    <p>Email bereits registriert.</p>
<?php } ?>
<?php } ?>
