--
-- SETUP
--
DROP DATABASE IF EXISTS `test`;
CREATE DATABASE `test`;
USE `test`;

--
-- DDL
--

DROP TABLE IF EXISTS `bike`;

CREATE TABLE `bike`(
    `id` INT NOT NULL AUTO_INCREMENT,
    `city_id` VARCHAR(10),
    `status_id` INT DEFAULT 1,
    `charge_perc` DECIMAL(5,2),
    `coords` VARCHAR(100),

    PRIMARY KEY (`id`)
);

LOAD DATA LOCAL INFILE '/docker-entrypoint-initdb.d/bike_data.csv'
INTO TABLE `bike`
CHARSET utf8
FIELDS
    TERMINATED BY ','
    ENCLOSED BY '"'
LINES
    TERMINATED BY '\r\n'
IGNORE 1 LINES
(id, city_id, coords)
;
