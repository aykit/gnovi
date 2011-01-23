<!DOCTYPE HTML>
<html>
  <head>
  <meta charset="UTF-8">
  <title><?=htmlspecialchars($title)?></title>
<?php foreach ($javaScripts as $script) { ?>
  <script type="text/javascript" src="<?=htmlspecialchars($script)?>"></script>
<?php } ?>
<?php foreach ($styleSheets as $sheet) { ?>
  <link rel="stylesheet" type="text/css" href="<?=htmlspecialchars($sheet)?>">
<?php } ?>
  </head>
  <body>
    <nav>
      <ul id="ulfront">
        <li>
          <ul id="nav">
            <li><img src="http://gnovi.org/test/images/gnovi_klein.png" alt="gnovi_klein" width="35" height="38"></li>
            <li>Profil</li>
            <li>Anlauf</li>
            <li>Ich</li>
            <li>Wir</li>
            <li>Hilfe</li>
            <li>&uuml;ber gnovi</li>
          </ul>
        </li>
      </ul>
    </nav>
    <br>
    <div id="navbar"></div>
