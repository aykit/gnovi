<?php

chdir("..");
require_once "php/page.php";

class GraphPage extends Page
{
    public function __construct()
    {
        $this->requireLogin();

        $this->drawHeader("Graph",
            array("/js/mootools.js", "/js/game.js", "/js/graph.js", "/js/graphics.js"), 
            array("/styles/main.css"));

        print('    <canvas id="graph" width="640" height="480"></canvas>' . "\n");

        /*$str = "%32;?:@& =+$,ößюфド"; // no slash allowed!!!
        $encoded = rawurlencode($str);

        print("<p>test: " . htmlspecialchars($str) . "</p>");
        print("<p>result: " . htmlspecialchars($_SERVER["QUERY_STRING"]) . "</p>");
        print('<p>encoded: <a style="color: black;" href="/graph/' . htmlspecialchars($encoded) . '"> ' . htmlspecialchars($encoded) . '</a></p>');*/

        $this->drawFooter();
    }
}

new GraphPage();

?>
