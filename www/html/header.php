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
