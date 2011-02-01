<?php

require_once "../php/page.php";

class UeberPage extends Page
{
    public function __construct()
    {
        $this->drawHeader("Input",
            array(), 
            array("/styles/reset.css", "/styles/main.css"));

        include "../html/ueber_header.php";
        include "../html/ueber.php";
        
        $this->drawFooter();
    }
}

new UeberPage();

?>