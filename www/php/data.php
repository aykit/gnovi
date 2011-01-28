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

        $this->setResponseData("Haus");
        //$this->setResponseData("/!%66; ?_:/.@&=+$,ößюфド\\%%\\\\1");
    }

    protected function findWord($word)
    {
        if (!$this->connectDb())
            return null;

        // TODO: lookup the letter case in the word database
        $word = ucfirst($word);

        $escWord = $this->db->escape_string($word);

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

        if (!$this->connectDb())
            return;

        $escLocation = $this->db->escape_string($location);
        $intUserId = (int)$this->userId;

        $wordInfo = $this->findWord($initialWord);
        if (!$wordInfo)
            return;
        $intInitialWordId = (int)$wordInfo["id"];

        $this->db->query("INSERT INTO `Runs` (`UserID`, `InitialWordID`, `Time`, `LocationTMP`) " . 
            "VALUES ('$intUserId', '$intInitialWordId', UNIX_TIMESTAMP(), '$escLocation')");
        if (!$this->checkForDbError())
            return;

        $runId = $this->db->insert_id;

        foreach ($words as $wordData)
        {
            $word = (string)@$wordData["word"];
            $intTitlePos = (int)@$wordData["titlePos"];
            $intLocationPos = (int)@$wordData["locationPos"];
            $connotation = (string)@$wordData["connotation"];
            $escConnotation = $this->db->escape_string($connotation);

            $wordInfo = $this->findWord($word);
            if (!$wordInfo)
                return;
            $intWordId = (int)$wordInfo["id"];

            $this->db->query("INSERT INTO `RunWords` " . 
                "(`RunID`, `WordID`, `InitialWordNearness`, `LocationNearness`, `Connotation`) " . 
                "VALUES ('$runId', '$intWordId', '$intTitlePos', '$intLocationPos', '$escConnotation')");
            if (!$this->checkForDbError())
                return;
        }

        $this->setResponseData(null);
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
