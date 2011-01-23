<?php

chdir("..");
require_once "php/page.php";

class InputPage extends Page
{
    public function draw()
    {
        $this->drawHeader("Input",
            array("js/mootools.js", "js/game.js", "js/input.js", "js/inputstates.js", "js/graphics.js"),
            array("input.css"));

        print('<canvas id="game" width="640" height="480"></canvas>');

        $this->drawFooter();
    }
}

$page = new InputPage();
$page->draw();

?>
