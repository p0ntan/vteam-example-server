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
    `id` INT NOT NULL,
    `city_id` VARCHAR(10) NOT NULL,
    `status_id` INT NOT NULL,
    `geometry` VARCHAR(150) NOT NULL,

    PRIMARY KEY (`id`)
);

LOAD DATA LOCAL INFILE '/docker-entrypoint-initdb.d/bike_data.csv'
INTO TABLE `bike`
CHARSET utf8
FIELDS
    TERMINATED BY ','
LINES
    TERMINATED BY '\n'
IGNORE 1 LINES
;
