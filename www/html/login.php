    <form action="<?=htmlspecialchars($_SERVER["REQUEST_URI"])?>" method="post">
      <p>
        <label>Email:</label>
        <input id="email" type="email" value="<?=htmlspecialchars($email)?>" required name="e">
      </p>
      <p>
        <label>Passwort:</label>
        <input id="password" type="password" value="" required name="p">
      </p>
      <input type="submit" value="Einloggen">
    </form>
<?php if ($posted) { ?>
<?php if ($email == "" || $password == "") { ?>
    <p>Email und Passwort eingeben!</p>
<?php } else { ?>
    <p>Ungülte Email / Passwort</p>
<?php } ?>
<?php } ?>
