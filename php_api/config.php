<?php
    class Database {
        private static $instance = null;
        private $connection;

        private function __construct()
        {
            $db_host = "wheatley.cs.up.ac.za";
            $db_user = "u22906160";
            $db_pass = "TOMLSBUEGYJLA3T2TKN3QVB4TRNNWVNT";
            $db_name = "u22906160_BrandRace";

            $this->connection = new mysqli($db_host, $db_user, $db_pass, $db_name);

            if ($this->connection->connect_error) {
                die("Connection failed: " . $this->connection->connect_error);
            }
        }

        public static function getInstance()
        {
            if (!self::$instance) {
                self::$instance = new Database();
            }

            return self::$instance;
        }

        public function getConnection()
        {
            return $this->connection;
        }
    }
?>