<?php

chdir("..");
require_once "php/page.php";

class InputPage extends Page
{
    public function __construct()
    {
        $this->requireLogin();

        $this->drawHeader("Input",
            array("js/mootools.js", "js/game.js", "js/input.js", "js/inputstates.js", "js/graphics.js"), array());

        print('    <canvas id="game" width="640" height="480"></canvas>' . "\n");

        $this->drawFooter();
    }
}

new InputPage();

?>