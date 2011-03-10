<!DOCTYPE HTML>
<html>
  <head>
  <meta charset="utf-8"> 
  <title><?=htmlspecialchars($title)?></title>
  <script type="text/javascript" src="http://piwik.gerade.org/piwik.js"></script>
  <script type="text/javascript" src="/js/piwik.js"></script>
  <script type="text/javascript" src="/js/modernizr_min.js"></script>
  <script type="text/javascript" src="/js/html5check.js"></script>
<?php foreach ($javaScripts as $script) { ?>
  <script type="text/javascript" src="<?=htmlspecialchars($script)?>"></script>
<?php } ?>
  <link rel="stylesheet" type="text/css" href="/styles/reset.css">
  <link rel="stylesheet" type="text/css" href="/styles/font.css">
  <link rel="stylesheet" type="text/css" href="/styles/navigation.css">
<?php foreach ($styleSheets as $sheet) { ?>
  <link rel="stylesheet" type="text/css" href="<?=htmlspecialchars($sheet)?>">
<?php } ?>
  <link rel="icon" href="/images/gnovi_klein.png">
  </head>
  <body<?=$onload != '' ? ' onload="' . htmlspecialchars($onload) . '"' : ''?>>
    <nav>
      <ul>
        <li>
          <ul id="nav">
            <li>
              <a href="<?=htmlspecialchars(PageUrls::START)?>">
                <img src="/images/gnovi_klein.png" alt="gnovi_klein" width="35" height="38">
              </a>
            </li>
            <li><a href="<?=htmlspecialchars(PageUrls::PROFILE)?>">Profil</a></li>
            <li><a href="<?=htmlspecialchars(PageUrls::INPUT)?>">Anlauf</a></li>
            <li><a id="personal_graph_link" href="<?=htmlspecialchars(PageUrls::PERSONAL_GRAPH)?>">Ich</a></li>
            <li><a id="global_graph_link" href="<?=htmlspecialchars(PageUrls::GLOBAL_GRAPH)?>">Wir</a></li>
            <li><a href="<?=htmlspecialchars(PageUrls::MANUAL)?>">Über gnovi</a></li>
            <li><a id="global_graph_link" href="http://blog.gnovi.org">Blog</a></li>
<?php if ($loggedin) { ?>
            <li>eingeloggt als <?=htmlspecialchars($username)?> | <a href="/ausloggen">X</a></li>
<?php } else { ?>
            <li><a href="/einloggen">Einloggen</a></li>
<?php } ?>
          </ul>
        </li>
      </ul>
    </nav>
    <br>
    <div id="navbar"></div>
    <noscript>
      <p>
        Enable Javascript!
        <!-- Piwik -->
        <img src="http://piwik.gerade.org/piwik.php?idsite=10" alt="">
      </p>
    </noscript>
