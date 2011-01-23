<?php

require_once "database.php";

switch (@$_GET["cmd"])
{
case "getword":
    getWord();
    break;
case "getgraph":
	getGraph((int)@$_GET["id"]);
	break;
}

function getWord()
{
    $db = getDb();
    exitWithData("Haus");
}

function getGraph($id)
{
    $db = getDb();

	$sampleA = '{
		"root": {"id": 1, "label": "root"},
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

	if ($id == 4)
		print($sampleB);
	else
		print($sampleA);
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
        "error" => $error,
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
