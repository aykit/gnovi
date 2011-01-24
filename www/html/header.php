<!DOCTYPE HTML>
<html>
  <head>
  <meta charset="UTF-8">
  <title><?=htmlspecialchars($title)?></title>
<?php foreach ($javaScripts as $script) { ?>
  <script type="text/javascript" src="<?=htmlspecialchars($script)?>"></script>
<?php } ?>
  <link rel="stylesheet" type="text/css" href="/styles/reset.css">
  <link rel="stylesheet" type="text/css" href="/styles/font.css">
  <link rel="stylesheet" type="text/css" href="/styles/navigation.css">
<?php foreach ($styleSheets as $sheet) { ?>
  <link rel="stylesheet" type="text/css" href="<?=htmlspecialchars($sheet)?>">
<?php } ?>
  </head>
  <body>
    <nav>
      <ul id="ulfront">
        <li>
          <ul id="nav">
            <li>
              <a href="<?=htmlspecialchars(PageUrls::START)?>">
                <img src="/images/gnovi_klein.png" alt="gnovi_klein" width="35" height="38">
              </a>
            </li>
            <li><a href="<?=htmlspecialchars(PageUrls::PROFILE)?>">Profil</a></li>
            <li><a href="<?=htmlspecialchars(PageUrls::RUN)?>">Anlauf</a></li>
            <li><a id="graph_link" href="graph">Ich</a></li>
            <li>Wir</li>
            <li>Hilfe</li>
            <li>Über gnovi</li>
            <li>eingeloggt als <?=htmlspecialchars($username)?> </li>
          </ul>
        </li>
      </ul>
    </nav>
    <br>
    <div id="navbar"></div>
