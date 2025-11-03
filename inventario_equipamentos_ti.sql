-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: 25-Out-2025 às 03:28
-- Versão do servidor: 10.1.37-MariaDB
-- versão do PHP: 7.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

--
-- Database: `inventario_equipamentos_ti`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `computadores`
--

CREATE TABLE `computadores` (
  `id` int(11) NOT NULL,
  `marca` varchar(255) NOT NULL,
  `modelo` varchar(255) NOT NULL,
  `patrimonio` varchar(255) DEFAULT NULL,
  `serialnumber` varchar(255) DEFAULT NULL,
  `setor` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `impressoras`
--

CREATE TABLE `impressoras` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `modelo` varchar(255) NOT NULL,
  `setor` varchar(255) DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `impressoras`
--

INSERT INTO `impressoras` (`id`, `nome`, `modelo`, `setor`, `ip`) VALUES
(1, 'A3 - ADMINISTRATIVO', 'CANON COLORIDA', 'ADM', '10.0.1.37'),
(2, 'A3 - NIC - DIRETORIA', 'CANON COLORIDA', 'NIC - DIRETORIA', '10.0.1.36'),
(3, 'A4 - METROLOGIA', 'LEXMARK', 'LABORATORIO-QUALIDADE', '10.0.1.28'),
(4, 'A4 - PCPM', 'LEXMARK', 'PCPM', '10.0.1.34'),
(5, 'NF-EXPEDICAO', 'LEXMARK', 'EXPEDIÇÃO', '10.0.1.31'),
(6, 'A4 - AMBULATORIO', 'LEXMARK', 'SSMA', '10.0.1.35');

-- --------------------------------------------------------

--
-- Estrutura da tabela `toners`
--

CREATE TABLE `toners` (
  `id` int(11) NOT NULL,
  `modelo` varchar(255) NOT NULL,
  `quantidade_novo` int(11) NOT NULL DEFAULT '0',
  `quantidade_usado` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `toners`
--

INSERT INTO `toners` (`id`, `modelo`, `quantidade_novo`, `quantidade_usado`) VALUES
(1, 'TN-3492', 0, 0),
(2, 'TN-3472', 0, 0),
(3, 'TN-2370', 0, 0),
(4, 'TN-1060', 0, 0),
(5, 'TN-750', 0, 0);

-- --------------------------------------------------------

--
-- Estrutura da tabela `unidadeimagem`
--

CREATE TABLE `unidadeimagem` (
  `id` int(11) NOT NULL,
  `modelo` varchar(255) NOT NULL,
  `quantidade_novo` int(11) NOT NULL DEFAULT '0',
  `quantidade_usado` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `unidadeimagem`
--

INSERT INTO `unidadeimagem` (`id`, `modelo`, `quantidade_novo`, `quantidade_usado`) VALUES
(1, 'DR-3440', 0, 0),
(2, 'DR-2340', 0, 0),
(3, 'DR-1060', 0, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `impressoras`
--
ALTER TABLE `impressoras`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `toners`
--
ALTER TABLE `toners`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `unidadeimagem`
--
ALTER TABLE `unidadeimagem`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `computadores`
--
ALTER TABLE `computadores`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `impressoras`
--
ALTER TABLE `impressoras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `toners`
--
ALTER TABLE `toners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `unidadeimagem`
--
ALTER TABLE `unidadeimagem`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `computadores`
--
ALTER TABLE `computadores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;