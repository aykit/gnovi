<?php

require_once "database.php";

class DataExchanger
{
    public function __construct()
    {
        $displayErrors = strtolower(ini_get("display_errors"));
        $this->returnErrorDetails = $displayErrors == "1" || $displayErrors == "on";

        if (session_id() == "")
            session_start();

        $this->userId = (int)@$_SESSION['ID'];

        if ($this->userId > 0)
        {
            switch (@$_GET["cmd"])
            {
            case "getword":
                $this->returnRandomWord();
                break;
            case "getgraph":
                $this->returnGraphData(@$_GET["word"]);
                break;
            case "storerun":
                $this->storeRun(json_decode(@$_GET["data"], true));
                break;
            case "findwords":
                $this->findWords(json_decode(@$_GET["words"], true));
                break;
            default:
                $this->setResponseError("unknown_command", @$_GET["cmd"]);
            }
        }
        else
            $this->setResponseError("login", "Not logged in.");

        print(json_encode($this->response));
    }

    protected function returnRandomWord()
    {
        if (!$this->connectDb())
            return;

        $this->setResponseData("Fernseher");
        //$this->setResponseData("/!%66; ?_:/.@&=+$,ößюфド\\%%\\\\1");
    }

    protected function findWord($word)
    {
        if (!$this->connectDb())
            return null;

        $escWord = $this->db->escape_string($word);

        $result = $this->db->query("SELECT `Word` FROM `Wordcheck` WHERE `Word` = '$escWord'");
        if (!$this->checkForDbError())
            return null;

        $row = $result->fetch_assoc();
        if ($row)
        {
            $word = $row["Word"];
            $escWord = $this->db->escape_string($word);
        }

        // Insert the word or update the entry to reflect letter case changes
        $this->db->query("INSERT INTO `Words` (`Word`) VALUES ('$escWord') " .
            "ON DUPLICATE KEY UPDATE `Word` = '$escWord'");
        if (!$this->checkForDbError())
            return null;

        $id = (int)$this->db->insert_id;

        // in case nothing hast changed insert_id is zero, so query the id separately
        if ($id == 0)
        {
            $result = $this->db->query("SELECT `ID` FROM `Words` WHERE `Word` = '$escWord'");
            if (!$this->checkForDbError())
                return null;

            $row = $result->fetch_assoc();
            if (!$row)
            {
                $this->setResponseError("database", "Could not get word ID.");
                return null;
            }

            $id = (int)$row["ID"];
        }

        return array("id" => $id, "word" => $word);
    }

    protected function findWords($words)
    {
        if (!DataExchanger::isStringArray($words))
        {
            $this->setResponseError("value", "Invalid input.");
            return;
        }

        $wordMap = array();
        foreach ($words as $word)
        {
            if ($word == "." || $word == "..")
                continue;

            $wordInfo = $this->findWord($word);
            if (!$wordInfo)
                return;
            $wordMap[] = $wordInfo;
        }

        $this->setResponseData($wordMap);
    }

    protected function storeRun($data)
    {
        $initialWord = @$data["initialWord"];
        $location = @$data["location"];
        $words = @$data["words"];

        if (!is_string($initialWord) || $initialWord == "." || $initialWord == ".." ||
            !is_string($location) ||
            !is_array($words))
        {
            $this->setResponseError("value", "Invalid input.");
            return;
        }

        $wordInfo = $this->findWord($initialWord);
        if (!$wordInfo)
            return;
        $initialWordId = $wordInfo["id"];

        $checkedWords = array();
        $wordsForInitialWord = array();
        $wordsForLocation = array();
        foreach ($words as $wordData)
        {
            $word = @$wordData["word"];
            $titlePos = isset($wordData["titlePos"]) ? $wordData["titlePos"] : 0;
            $locationPos = isset($wordData["locationPos"]) ? $wordData["locationPos"] : 0;
            $connotation = @$wordData["connotation"];

            if (!is_string($word) || $word == "." || $word == ".." ||
                !is_int($titlePos) ||
                !is_int($locationPos) ||
                ($connotation !== "+" && $connotation !== "-"))
                continue;

            $wordInfo = $this->findWord($word);
            if (!$wordInfo)
                return;

            $checkedWords[] = array(
                "id" => $wordInfo["id"],
                "distanceFromInitialWord" => $titlePos,
                "distanceFromLocation" => $locationPos,
                "connotation" => $connotation,
            );

            if ($titlePos > 0)
                $wordsForInitialWord[$titlePos - 1] = $wordInfo["id"];
            if ($locationPos > 0)
                $wordsForLocation[$locationPos - 1] = $wordInfo["id"];
        }

        $time = time();

        if (!$this->addRunn($this->userId, $initialWordId, $time, $location))
            return;

        $runId = $this->db->insert_id;

        foreach ($checkedWords as $wordInfo)
        {
            if (!$this->addRunWord($runId, $wordInfo["id"], $wordInfo["distanceFromInitialWord"],
                $wordInfo["distanceFromLocation"], $wordInfo["connotation"]))
                return;
        }

        for ($i = 0; $i < count($wordsForInitialWord); $i++)
        {
            if (!isset($wordsForInitialWord[$i]))
                continue;
            $wordId = $wordsForInitialWord[$i];

            $strength = 1 - $i * 0.02;
            if ($strength > 0.000001)
            {
                if (!$this->addRelations($initialWordId, $wordId, $this->userId, $time, $strength))
                    return;
            }

            for ($j = $i + 1; $j < count($wordsForInitialWord); $j++)
            {
                if (!isset($wordsForInitialWord[$j]))
                    continue;
                $otherWordId = $wordsForInitialWord[$j];

                $strength = 1 - ($j - $i - 1) * 0.1;
                if ($strength > 0.000001)
                {
                    if (!$this->addRelations($wordId, $otherWordId, $this->userId, $time, $strength))
                        return;
                }
            }
        }

        for ($i = 0; $i < count($wordsForLocation); $i++)
        {
            if (!isset($wordsForLocation[$i]))
                continue;
            $wordId = $wordsForLocation[$i];

            /*$strength = 1 - $i * 0.02;
            if ($strength > 0.000001)
            {
                if (!$this->addRelations($initialWordId, $wordId, $this->userId, $time, $strength))
                    return;
            }*/

            for ($j = $i + 1; $j < count($wordsForLocation); $j++)
            {
                if (!isset($wordsForLocation[$j]))
                    continue;
                $otherWordId = $wordsForLocation[$j];

                $strength = 1 - ($j - $i - 1) * 0.1;
                if ($strength > 0.000001)
                {
                    if (!$this->addRelations($wordId, $otherWordId, $this->userId, $time, $strength))
                        return;
                }
            }
        }

        $this->setResponseData(null);
    }

    protected function addRunn($userId, $initialWordId, $time, $location)
    {
        $intUserId = (int)$userId;
        $intInitialWordId = (int)$initialWordId;
        $intTime = (int)$time;
        $escLocation = $this->db->escape_string((string)$location);

        $this->db->query("INSERT INTO `Runs` (`UserID`, `InitialWordID`, `Time`, `LocationTMP`) " . 
            "VALUES ('$intUserId', '$intInitialWordId', '$time', '$escLocation')");

        return $this->checkForDbError();
    }

    protected function addRunWord($runId, $wordId, $distanceFromInitialWord, $distanceFromLocation, $connotation)
    {
        $intRunId = (int)$runId;
        $intWordId = (int)$wordId;
        $intDistanceFromInitialWord = (int)$distanceFromInitialWord;
        $intDistanceFromLocation = (int)$distanceFromLocation;
        $escConnotation = $this->db->escape_string((string)$connotation);

        $this->db->query("INSERT INTO `RunWords` " . 
            "(`RunID`, `WordID`, `DistanceFromInitialWord`, `DistanceFromLocation`, `Connotation`) VALUES " .
            "('$intRunId', '$intWordId', '$intDistanceFromInitialWord', '$intDistanceFromLocation', '$escConnotation')");

        return $this->checkForDbError();
    }

    protected function addRelations($word1Id, $word2Id, $userId, $time, $strength)
    {
        $intWord1Id = (int)$word1Id;
        $intWord2Id = (int)$word2Id;
        $intUserId = (int)$userId;
        $intTime = (int)$time;
        $floatStrength = (float)$strength;

        $this->db->query("INSERT INTO `Relations` " . 
            "(`FromWordID`, `ToWordID`, `UserID`, `Time`, `Strength`) VALUES " .
            "('$intWord1Id', '$intWord2Id', '$intUserId', '$intTime', '$floatStrength') " .
            "ON DUPLICATE KEY UPDATE `Strength` = `Strength` + '$floatStrength'");

        $this->db->query("INSERT INTO `Relations` " . 
            "(`FromWordID`, `ToWordID`, `UserID`, `Time`, `Strength`) VALUES " .
            "('$intWord2Id', '$intWord1Id', '$intUserId', '$intTime', '$floatStrength') " .
            "ON DUPLICATE KEY UPDATE `Strength` = `Strength` + '$floatStrength'");

        return $this->checkForDbError();
    }

    protected function returnGraphData($word)
    {
        if (!$this->connectDb())
            return;

        $data1 = array(
            "root" => array("id" => 1, "label" => "Haus"),
            "nodes" => array(
                array("id" => 32, "label" => "du"),
                array("id" => 3, "label" => "ich"),
                array("id" => 4, "label" => "bla"),
                array("id" => 15, "label" => "blub"),
                array("id" => 6, "label" => "genau"),
            )
        );

        $data2 = array(
            "root" => array("id" => 15, "label" => $word),
            "nodes" => array(
                array("id" => 3, "label" => "ich"),
                array("id" => 1, "label" => "Haus"),
                array("id" => 11, "label" => "warum"),
                array("id" => 32, "label" => "du"),
                array("id" => 7, "label" => "nix"),
                array("id" => 8, "label" => "jap"),
            )
        );

        $data = $word == "Haus" ? $data1 : $data2;

        $this->setResponseData($data);
    }

    protected function connectDb()
    {
        if ($this->db)
            return true;

        $this->db = new Database();
        if (!$this->db->connect())
        {
            $this->setResponseError("database", $this->db->connectError);
            $this->db = null;
            return false;
        }

        return true;
    }

    protected function checkForDbError()
    {
        if ($this->db->errno != 0)
        {
            $this->setResponseError("database", $this->db->error);
            return false;
        }
        return true;
    }

    protected function setResponseError($errorType, $errorDetails)
    {
        $this->response = array(
            "status" => "error",
            "errorType" => (string)$errorType,
            "errorDetails" => $this->returnErrorDetails ? (string)$errorDetails : "",
        );
    }

    protected function setResponseData($data)
    {
        $this->response = array("status" => "success", "data" => $data);
    }

    protected function isStringArray($data)
    {
        if (!is_array($data))
            return false;
        foreach ($data as $value)
            if (!is_string($value))
                return false;
        return true;
    }

    protected $response = null;
    protected $db = null;
    protected $userId = 0;
    protected $returnErrorDetails = false;
}

$dataExchanger = new DataExchanger();

?>
