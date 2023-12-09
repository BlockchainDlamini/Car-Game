<?php
    require_once "config.php";

    class CarBrandAPI
    {
        private $db;

        public function __construct()
        {
            $this->db = Database::getInstance()->getConnection();
        }

        public function getRandomBrands()
        {
            $query = "SELECT * FROM car_brands ORDER BY RAND() LIMIT 5";
            $result = $this->db->query($query);

            $brands = array();
            while ($row = $result->fetch_assoc()) {
                $brand = array(
                    'brand_name' => $row['car_brand'],
                    'brand_link' => $row['brand_link']
                );
                array_push($brands, $brand);
            }

            header('Content-Type: application/json');
            echo json_encode($brands);
        }
    }

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        if ($data['type'] == 'GetRandomBrands') {
            $api = new CarBrandAPI();
            $api->getRandomBrands();
        }
    }
?>
