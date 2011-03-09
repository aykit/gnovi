<?php

require_once "../php/page.php";

class GraphPage extends Page
{
    public function __construct()
    {
        $this->requireLogin($_SERVER["REQUEST_URI"]);

        $this->drawHeader("Wir",
            array("/js/mootools.js", "/js/game.js", "/js/graph.js", "/js/graphics.js"), 
            array("/styles/main.css"), 'new Graph(document.getElementById("graph"), "all")');

        include "../html/graph.php";

        $this->drawFooter();
    }
}

new GraphPage();

?>
