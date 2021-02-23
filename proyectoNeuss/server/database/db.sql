-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema neuss
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `neuss` DEFAULT CHARACTER SET utf8 ;
USE `neuss` ;

-- -----------------------------------------------------
-- Table `neuss`.`User`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `neuss`.`User` (
  `idUser` INT NOT NULL AUTO_INCREMENT,
  `Name` VARCHAR(45) NOT NULL,
  `LastName` VARCHAR(45) NOT NULL,
  `Email` VARCHAR(45) NOT NULL,
  `Img` VARCHAR(45) NULL,
  `Password` CHAR(128) NOT NULL,
  PRIMARY KEY (`idUser`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `neuss`.`Customer`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `neuss`.`Customer` (
  `idCustomer` INT NOT NULL AUTO_INCREMENT,
  `Address` VARCHAR(45) NOT NULL,
  `Phone` VARCHAR(45) NOT NULL,
  `idUser` INT NOT NULL,
  PRIMARY KEY (`idCustomer`, `idUser`),
  INDEX `fk_Customer_User_idx` (`idUser` ASC) VISIBLE,
  CONSTRAINT `fk_Customer_User`
    FOREIGN KEY (`idUser`)
    REFERENCES `neuss`.`User` (`idUser`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `neuss`.`Admin`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `neuss`.`Admin` (
  `idAdmin` INT NOT NULL AUTO_INCREMENT,
  `idUser` INT NOT NULL,
  PRIMARY KEY (`idAdmin`, `idUser`),
  INDEX `fk_Admin_User1_idx` (`idUser` ASC) VISIBLE,
  CONSTRAINT `fk_Admin_User1`
    FOREIGN KEY (`idUser`)
    REFERENCES `neuss`.`User` (`idUser`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `neuss`.`Order`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `neuss`.`Order` (
  `idOrder` INT NOT NULL AUTO_INCREMENT,
  `Date` VARCHAR(45) NOT NULL,
  `Status` VARCHAR(45) NOT NULL,
  `idCustomer` INT NOT NULL,
  PRIMARY KEY (`idOrder`, `idCustomer`),
  INDEX `fk_Order_Customer1_idx` (`idCustomer` ASC) VISIBLE,
  CONSTRAINT `fk_Order_Customer1`
    FOREIGN KEY (`idCustomer`)
    REFERENCES `neuss`.`Customer` (`idCustomer`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `neuss`.`Course`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `neuss`.`Course` (
  `idCourse` INT NOT NULL AUTO_INCREMENT,
  `Name` VARCHAR(45) NOT NULL,
  `Stock` INT NULL,
  `Price` INT NULL,
  `Img` VARCHAR(45) NULL,
  `Description` VARCHAR(45) NULL,
  PRIMARY KEY (`idCourse`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `neuss`.`CourseOrder`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `neuss`.`CourseOrder` (
  `idCourseOrder` INT NOT NULL AUTO_INCREMENT,
  `idOrder` INT NOT NULL,
  `idCourse` INT NOT NULL,
  PRIMARY KEY (`idCourseOrder`, `idOrder`, `idCourse`),
  INDEX `fk_CourseOrder_Order1_idx` (`idOrder` ASC) VISIBLE,
  INDEX `fk_CourseOrder_Course1_idx` (`idCourse` ASC) VISIBLE,
  CONSTRAINT `fk_CourseOrder_Order1`
    FOREIGN KEY (`idOrder`)
    REFERENCES `neuss`.`Order` (`idOrder`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_CourseOrder_Course1`
    FOREIGN KEY (`idCourse`)
    REFERENCES `neuss`.`Course` (`idCourse`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
