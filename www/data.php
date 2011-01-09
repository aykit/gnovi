<?php

//error_reporting(E_ERROR);
error_reporting(E_ALL);

$cmd = $_GET["cmd"];

switch ($cmd)
{
case "getgraph":
	$id = (int)$_GET["id"];
	getGraph($id);
	break;
}

function getGraph($id)
{
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

	sleep(1);

	if ($id == 4)
		print($sampleB);
	else
		print($sampleA);
}

?>
