CREATE DATABASE  IF NOT EXISTS `proxmi_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `proxmi_db`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: proxmi_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `actividaddiaria`
--

DROP TABLE IF EXISTS `actividaddiaria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actividaddiaria` (
  `idActividad` int NOT NULL AUTO_INCREMENT,
  `idComprador` int NOT NULL,
  `fecha` date NOT NULL,
  `pasos` int NOT NULL DEFAULT '0',
  `distanciaKm` decimal(6,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`idActividad`),
  UNIQUE KEY `uq_comprador_fecha` (`idComprador`,`fecha`),
  CONSTRAINT `fk_actividad_comprador` FOREIGN KEY (`idComprador`) REFERENCES `comprador` (`idComprador`),
  CONSTRAINT `chk_actividad_distancia` CHECK ((`distanciaKm` >= 0)),
  CONSTRAINT `chk_actividad_pasos` CHECK ((`pasos` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividaddiaria`
--

LOCK TABLES `actividaddiaria` WRITE;
/*!40000 ALTER TABLE `actividaddiaria` DISABLE KEYS */;
/*!40000 ALTER TABLE `actividaddiaria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campanapublicitaria`
--

DROP TABLE IF EXISTS `campanapublicitaria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campanapublicitaria` (
  `idCampana` int NOT NULL AUTO_INCREMENT,
  `idTienda` int NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text,
  `radioKm` decimal(6,2) NOT NULL,
  `presupuesto` decimal(10,2) NOT NULL,
  `fechaInicio` datetime NOT NULL,
  `fechaFin` datetime NOT NULL,
  `estado` enum('borrador','activa','finalizada','cancelada') NOT NULL DEFAULT 'borrador',
  PRIMARY KEY (`idCampana`),
  KEY `fk_campana_comercio` (`idTienda`),
  CONSTRAINT `fk_campana_comercio` FOREIGN KEY (`idTienda`) REFERENCES `comercio` (`idTienda`),
  CONSTRAINT `chk_campana_fechas` CHECK ((`fechaFin` > `fechaInicio`)),
  CONSTRAINT `chk_campana_presupuesto` CHECK ((`presupuesto` >= 0)),
  CONSTRAINT `chk_campana_radio` CHECK ((`radioKm` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campanapublicitaria`
--

LOCK TABLES `campanapublicitaria` WRITE;
/*!40000 ALTER TABLE `campanapublicitaria` DISABLE KEYS */;
/*!40000 ALTER TABLE `campanapublicitaria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comercio`
--

DROP TABLE IF EXISTS `comercio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comercio` (
  `idTienda` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `descripcion` text,
  `direccion` varchar(255) NOT NULL,
  `latitud` decimal(10,7) DEFAULT NULL,
  `longitud` decimal(10,7) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idTienda`),
  UNIQUE KEY `idUsuario` (`idUsuario`),
  CONSTRAINT `fk_comercio_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comercio`
--

LOCK TABLES `comercio` WRITE;
/*!40000 ALTER TABLE `comercio` DISABLE KEYS */;
INSERT INTO `comercio` VALUES (1,1,'Café Proxmi','Comercio de prueba para desarrollar la API','Cartagena, Colombia',10.3910000,-75.4794000,1);
/*!40000 ALTER TABLE `comercio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comprador`
--

DROP TABLE IF EXISTS `comprador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comprador` (
  `idComprador` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `esPrime` tinyint(1) NOT NULL DEFAULT '0',
  `metaPasos` int NOT NULL DEFAULT '8000',
  PRIMARY KEY (`idComprador`),
  UNIQUE KEY `idUsuario` (`idUsuario`),
  CONSTRAINT `fk_comprador_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comprador`
--

LOCK TABLES `comprador` WRITE;
/*!40000 ALTER TABLE `comprador` DISABLE KEYS */;
/*!40000 ALTER TABLE `comprador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cupon`
--

DROP TABLE IF EXISTS `cupon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cupon` (
  `idCupon` int NOT NULL AUTO_INCREMENT,
  `idRecompensa` int NOT NULL,
  `idComprador` int NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `fechaEmision` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaVencimiento` datetime NOT NULL,
  `estado` enum('disponible','utilizado','vencido') NOT NULL DEFAULT 'disponible',
  PRIMARY KEY (`idCupon`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `fk_cupon_recompensa` (`idRecompensa`),
  KEY `fk_cupon_comprador` (`idComprador`),
  CONSTRAINT `fk_cupon_comprador` FOREIGN KEY (`idComprador`) REFERENCES `comprador` (`idComprador`),
  CONSTRAINT `fk_cupon_recompensa` FOREIGN KEY (`idRecompensa`) REFERENCES `recompensa` (`idRecompensa`),
  CONSTRAINT `chk_cupon_fechas` CHECK ((`fechaVencimiento` > `fechaEmision`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupon`
--

LOCK TABLES `cupon` WRITE;
/*!40000 ALTER TABLE `cupon` DISABLE KEYS */;
/*!40000 ALTER TABLE `cupon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `participacionreto`
--

DROP TABLE IF EXISTS `participacionreto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `participacionreto` (
  `idParticipacion` int NOT NULL AUTO_INCREMENT,
  `idComprador` int NOT NULL,
  `idReto` int NOT NULL,
  `fechaInicio` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaFinalizacion` datetime DEFAULT NULL,
  `distanciaRecorridaKm` decimal(6,2) NOT NULL DEFAULT '0.00',
  `estado` enum('en_progreso','completado','cancelado') NOT NULL DEFAULT 'en_progreso',
  PRIMARY KEY (`idParticipacion`),
  UNIQUE KEY `uq_comprador_reto` (`idComprador`,`idReto`),
  KEY `fk_participacion_reto` (`idReto`),
  CONSTRAINT `fk_participacion_comprador` FOREIGN KEY (`idComprador`) REFERENCES `comprador` (`idComprador`),
  CONSTRAINT `fk_participacion_reto` FOREIGN KEY (`idReto`) REFERENCES `reto` (`idReto`),
  CONSTRAINT `chk_participacion_distancia` CHECK ((`distanciaRecorridaKm` >= 0)),
  CONSTRAINT `chk_participacion_fechas` CHECK (((`fechaFinalizacion` is null) or (`fechaFinalizacion` >= `fechaInicio`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `participacionreto`
--

LOCK TABLES `participacionreto` WRITE;
/*!40000 ALTER TABLE `participacionreto` DISABLE KEYS */;
/*!40000 ALTER TABLE `participacionreto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto` (
  `idProducto` int NOT NULL AUTO_INCREMENT,
  `idTienda` int NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text,
  `categoria` varchar(80) DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idProducto`),
  KEY `fk_producto_comercio` (`idTienda`),
  CONSTRAINT `fk_producto_comercio` FOREIGN KEY (`idTienda`) REFERENCES `comercio` (`idTienda`),
  CONSTRAINT `chk_producto_precio` CHECK ((`precio` >= 0)),
  CONSTRAINT `chk_producto_stock` CHECK ((`stock` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
INSERT INTO `producto` VALUES (1,1,'Café americano','Café de prueba para Proxmi','Bebidas',4500.00,20,1),(2,1,'Camiseta Algodón Premium','Camiseta de corte clásico 100% algodón','Ropa',25.99,50,0),(3,1,'Termo de Acero Inoxidable','Mantiene las bebidas frías por 24 horas','Hogar',45.00,5,1),(4,1,'Llavero Metálico',NULL,NULL,4.50,100,0),(5,1,'Audífonos Bluetooth','Cancelación de ruido activa','Electrónica',89.90,12,1),(6,1,'Cuaderno Pasta Dura','80 hojas cuadriculadas','Papelería',12.50,0,1),(7,1,'Jugo de corozo','Jugo refrescante ','Bebidas',1.20,20,1),(8,1,'Jugo de Mango','Jugo refrescante ','Bebidas',1.20,15,1);
/*!40000 ALTER TABLE `producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recompensa`
--

DROP TABLE IF EXISTS `recompensa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recompensa` (
  `idRecompensa` int NOT NULL AUTO_INCREMENT,
  `idReto` int NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `tipo` enum('descuento','producto_gratis','beneficio') NOT NULL,
  `valorDescuento` decimal(5,2) DEFAULT NULL,
  `vigenciaDias` int NOT NULL DEFAULT '30',
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idRecompensa`),
  UNIQUE KEY `uq_recompensa_reto` (`idReto`),
  CONSTRAINT `fk_recompensa_reto` FOREIGN KEY (`idReto`) REFERENCES `reto` (`idReto`),
  CONSTRAINT `chk_recompensa_descuento` CHECK (((`valorDescuento` is null) or (`valorDescuento` between 0 and 100))),
  CONSTRAINT `chk_recompensa_vigencia` CHECK ((`vigenciaDias` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recompensa`
--

LOCK TABLES `recompensa` WRITE;
/*!40000 ALTER TABLE `recompensa` DISABLE KEYS */;
/*!40000 ALTER TABLE `recompensa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reto`
--

DROP TABLE IF EXISTS `reto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reto` (
  `idReto` int NOT NULL AUTO_INCREMENT,
  `idTienda` int NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descripcion` text,
  `distanciaKm` decimal(6,2) NOT NULL,
  `categoriaDistancia` enum('Pan comido','Reto','Lejos de casa') NOT NULL,
  `fechaInicio` datetime NOT NULL,
  `fechaFin` datetime NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idReto`),
  KEY `fk_reto_comercio` (`idTienda`),
  CONSTRAINT `fk_reto_comercio` FOREIGN KEY (`idTienda`) REFERENCES `comercio` (`idTienda`),
  CONSTRAINT `chk_reto_distancia` CHECK ((`distanciaKm` > 0)),
  CONSTRAINT `chk_reto_fechas` CHECK ((`fechaFin` > `fechaInicio`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reto`
--

LOCK TABLES `reto` WRITE;
/*!40000 ALTER TABLE `reto` DISABLE KEYS */;
/*!40000 ALTER TABLE `reto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `idUsuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `rol` enum('comprador','comercio','administrador') NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `fechaCreacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idUsuario`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Comercio de prueba','prueba@proxmi.com','HASH_DE_PRUEBA_NO_UTILIZABLE','comercio',1,'2026-10-24 16:43:50');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-25 13:53:28
