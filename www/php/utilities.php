<?php

class Utilities
{
    // test strings: "..", "/!%66; ?_:/.@&=+$,ößюфド\\%%\\\\1"
    public static function urlEncode($s)
    {
        $s = str_ireplace(
            array("+", "%", "_", "/", "\\", ".", " "),
            array("+0", "+1", "+2", "+3", "+4", "+5", "_"), $s);
        $s = rawurlencode($s); // escapes all except: - _ . ~

        // undo some escapings to make the url look nicer (optional)
        $s = str_ireplace(
            array("%3B", "%40", "%24", "%21", "%2A", "%28", "%29", "%2C", "%3A"),
            array(";", "@", "$", "!", "*", "(", ")", ",", ":"), $s);

        return $s;
    }

    // use $_SERVER["REQUEST_URI"]
    public static function urlDecode($s)
    {
        $s = rawurldecode($s);
        $s = str_ireplace(
            array("_", "+5", "+4", "+3", "+2", "+1", "+0"),
            array(" ", ".", "\\", "/", "_", "%", "+"), $s);
        return $s;
    }
}

?>
