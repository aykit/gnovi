<?php

require_once "database.php";
require_once "utilities.php";

class DataExchanger
{
    public function processRequest()
    {
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
            default:
                $this->setResponseError("Unknown command: " . @$_GET["cmd"]);
            }
        }
        else
            $this->setResponseError("Not logged in.");

        print(json_encode($this->response));
    }

    protected function returnRandomWord()
    {
        if (!$this->connectDb())
            return;

        $this->setResponseData("Haus");
        //$this->setResponseData("/!%66; ?_:/.@&=+$,ößюфド\\%%\\\\1");
    }

    protected function storeRun($data)
    {
        if (!$this->connectDb())
            return;

        $randomWord = $this->db->escape_string((string)$data["randomWord"]);
        $location = $this->db->escape_string((string)$data["location"]);

        $userId = $this->userId;

        // (insert location), get id
        $locationId = 0;

        // (insert random word), get id
        $randomWordId = 0; // TODO: das muss umbenannt werden in irgendwas wie headingWord

        $this->db->query("INSERT INTO `Runs` (`UserID`, `RandomWordID`, `LocationID`) " . 
            "VALUES ('$userId', '$randomWordId', '$locationId')");
        if (!$this->checkForDbError())
            return;

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
            $this->setResponseError("Database: " . $this->db->connectError);
            $this->db = null;
            return false;
        }

        return true;
    }

    protected function checkForDbError()
    {
        if ($this->db->errno != 0)
        {
            $this->setResponseError("Database: " . $this->db->error);
            return false;
        }
        return true;
    }

    protected function setResponseError($error)
    {
        $this->response = array("status" => "error", "error" => (string)$error);
    }

    protected function setResponseData($data)
    {
        $this->response = array("status" => "success", "data" => $data);
    }

    protected $response = null;
    protected $db = null;
    protected $userId = 0;
}

$dataExchanger = new DataExchanger();
$dataExchanger->processRequest();

?>
