<?php

require_once "page.php";

class InputPage extends Page
{
    public function draw()
    {
        $this->drawHeader("Input",
            array("mootools.js", "game.js", "input.js", "inputstates.js", "graphics.js"),
            array("input.css"));

        print('<canvas id="game" width="640" height="480"></canvas>');

        $this->drawFooter();
    }
}

$page = new InputPage();
$page->draw();

?>
