    <section>
      <form action="<?=htmlspecialchars($_SERVER["REQUEST_URI"])?>" method="post">
        <p>
          <label>Name:</label>
          <input id="username" type="text" placeholder="Gewünschter Username" value="<?=htmlspecialchars($username)?>" required name="u">
        </p>
        <p>
          <label>Email:</label>
          <input id="email" type="email" placeholder="E-Mail adresse eingeben" value="<?=htmlspecialchars($email)?>" required name="e">
        </p>
        <p>
          <label>Passwort:</label>
          <input id="password1" type="password" placeholder="Gewünschtes Passwort" 
            value="<?=htmlspecialchars($passwordSafe1)?>" required name="p1">
        </p>
        <p>
          <label>Passwort:</label>
          <input id="password2" type="password" placeholder="Passwort wiederholen" value="<?=htmlspecialchars($passwordSafe2)?>" required
            onforminput="setCustomValidity(value != password1.value ? 'Passwörter sind nicht gleich.' : '')" name="p2">
        </p>
        <input type="submit" value="Registrieren">
      </form>
    </section>
<?php if ($posted) { ?>
<?php if ($password1 == "" || $password2 == "") { ?>
      <mark>Passwort eingeben!</mark>
<?php } else if ($passwordMismatch) { ?>
      <mark>Passwörter sind nicht gleich.</mark>
<?php } ?>
<?php if ($username == "") { ?>
      <mark>Name eingeben!</mark>
<?php } ?>
<?php if ($email == "") { ?>
      <mark>Email eingeben!</mark>
<?php } else if (!$emailValid) { ?>
      <mark>Email ungültig.</mark>
<?php } else if ($emailExists) { ?>
      <mark>Email bereits registriert.</mark>
<?php } ?>
<?php } ?>
    