<?php

require_once "../php/page.php";

class GraphPage extends Page
{
    public function __construct()
    {
        $this->requireLogin($_SERVER["REQUEST_URI"]);

        $this->drawHeader("Graph",
            array("/js/mootools.js", "/js/game.js", "/js/graph.js", "/js/graphics.js"), 
            array("/styles/main.css"));

        print('    <canvas id="graph" width="640" height="480"></canvas>' . "\n");

        $this->drawFooter();
    }
}

new GraphPage();

?>
