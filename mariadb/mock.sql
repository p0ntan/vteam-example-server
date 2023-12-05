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

CREATE TABLE `user`(
    `id` INT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(100) NOT NULL,
    `card_nr` VARCHAR(100) NOT NULL,
    `card_type` INT NOT NULL,
    `balance` DECIMAL(7,2) NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT TRUE,

    PRIMARY KEY (`id`),
    UNIQUE KEY `email` (`email`)
);

CREATE TABLE `trip`(
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `bike_id` INT NOT NULL,
    `start_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `end_time` DATETIME,
    `start_pos` VARCHAR(100),
    `end_pos` VARCHAR(100),

    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
    FOREIGN KEY (`bike_id`) REFERENCES `bike` (`id`)
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

LOAD DATA LOCAL INFILE '/docker-entrypoint-initdb.d/user.csv'
INTO TABLE `user`
CHARSET utf8
FIELDS
    TERMINATED BY ','
    ENCLOSED BY '"'
LINES
    TERMINATED BY '\n'
IGNORE 1 LINES
(id, email, card_nr, card_type, balance)
;
