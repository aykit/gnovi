      <section>
        <form action="<?=htmlspecialchars($_SERVER["REQUEST_URI"])?>" method="post">
          <p>
            <label>Email:</label>
            <input id="email" type="email" placeholder="E- Mail Adresse" value="<?=htmlspecialchars($email)?>" required 
              name="e" autofocus>
          </p>
          <p>
            <label>Passwort:</label>
            <input id="password" type="password" placeholder="Passwort" value="" required name="p">
          </p>
          <input type="submit" value="Einloggen">
        </form>
      </section>
      <?php if ($posted) { ?>
<?php if ($email == "" || $password == "") { ?>
        <mark>Email und Passwort eingeben!</mark>
<?php } else { ?>
        <mark>Ungültige Email / Passwort</mark>
<?php } ?>
<?php } ?>
      <p id="register"><a href="<?=htmlspecialchars(PageUrls::REGISTER)?>">Registrieren</a></p>