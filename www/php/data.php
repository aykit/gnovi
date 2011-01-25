<?php

require_once "database.php";
require_once "utilities.php";

class DataExchanger
{
    public function processRequest($request)
    {
        switch (@$request["cmd"])
        {
        case "getword":
            $this->returnRandomWord();
            break;
        case "getgraph":
            $this->returnGraphData(Utilities::urlDecode((string)@$request["word"]));
            break;
        default:
            $this->setResponseError("Unknown command");
        }

        print(json_encode($this->response));
    }

    protected function returnRandomWord()
    {
        if (!$this->connectDb())
            return;

        $this->setResponseData("Haus");
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
            "root" => array("id" => 15, "label" => "blub"),
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
}

$dataExchanger = new DataExchanger();
$dataExchanger->processRequest($_GET);

?>
