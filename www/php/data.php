<?php

require_once "database.php";
require_once "utilities.php";

switch (@$_GET["cmd"])
{
case "getword":
    getWord();
    break;
case "getgraph":
    getGraph(Utilities::urlDecode((string)@$_GET["word"]));
    break;
}

function getWord()
{
    $db = getDb();
    exitWithData("Haus");
}

function getGraph($word)
{
    $db = getDb();

    $word = json_encode($word);

    $sampleA = '{
        "root": {"id": 1, "label": ' . $word . '},
        "nodes":
        [
            {"id": 32, "label": "du"},
            {"id": 3, "label": "ich"},
            {"id": 4, "label": "bla"},
            {"id": 15, "label": "blub"},
            {"id": 6, "label": "genau"},
        ],
        "relations":
        [
            {"id2": 2, "id2": 3, "strength": 9},
        ],
    }';

    $sampleB = '{
        "root": {"id": 4, "label": "bla"},
        "nodes":
        [
            {"id": 3, "label": "ich"},
            {"id": 1, "label": "root"},
            {"id": 11, "label": "warum"},
            {"id": 32, "label": "du"},
            {"id": 7, "label": "nix"},
            {"id": 8, "label": "jap"},
        ],
        "relations":
        [
            {"id2": 2, "id2": 3, "strength": 9},
        ],
    }';

    print('{"status":"success", "data":');
    if ($word == "bla")
        print($sampleB);
    else
        print($sampleA);
    print('}');
}

function getDb()
{
    $db = new Database();
    if (!$db->connect())
        exitWithError($db->connectError);
    return $db;
}

function exitWithError($error)
{
    exit(json_encode(array(
        "status" => "error",
        "error" => (string)$error,
    )));
}

function exitWithData($data)
{
    exit(json_encode(array(
        "status" => "success",
        "data" => $data,
    )));
}

?>
