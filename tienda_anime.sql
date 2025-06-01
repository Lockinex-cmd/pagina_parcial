-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 28-05-2025 a las 18:16:59
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `tienda_anime`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`, `descripcion`, `imagen`, `created_at`) VALUES
(1, 'Manga', 'Amplia colección de mangas en español', 'img/manga.webp', '2025-05-04 00:49:25'),
(2, 'Figuras', 'Figuras de colección premium', 'img/figura.jpg', '2025-05-04 00:49:25'),
(3, 'Peluches', 'Peluches de tus personajes favoritos', 'img/peluche.webp', '2025-05-04 00:49:25'),
(4, 'Accesorios', 'Llaveros, pins, collares y más', 'img/accesorios.webp', '2025-05-04 00:49:25'),
(5, 'Escolar y Oficina', 'Cuadernos, bolígrafos y más', 'img/escolar.webp', '2025-05-04 00:49:25'),
(6, 'Dulces Japoneses', 'Snacks, ramen y dulces tradicionales', 'img/dulces.jpg', '2025-05-04 00:49:25'),
(7, 'Moda Otaku', 'Camisetas, sudaderas y cosplay', 'img/ropa.jpg', '2025-05-04 00:49:25'),
(8, 'Hogar', 'Artículos para decorar tu espacio', 'img/hogar.jpg', '2025-05-04 00:49:25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_orden`
--

CREATE TABLE `detalle_orden` (
  `id` int(11) NOT NULL,
  `orden_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_orden`
--

INSERT INTO `detalle_orden` (`id`, `orden_id`, `producto_id`, `cantidad`, `precio_unitario`) VALUES
(1, 1, 2, 1, 24.99),
(2, 1, 3, 1, 24.99),
(3, 2, 1, 2, 39.98);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes`
--

CREATE TABLE `ordenes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` varchar(50) DEFAULT 'pendiente',
  `total` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ordenes`
--

INSERT INTO `ordenes` (`id`, `user_id`, `fecha`, `estado`, `total`) VALUES
(1, 1, '2025-05-04 15:00:00', 'pendiente', 49.98),
(2, 2, '2025-05-04 17:30:00', 'completado', 79.97);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `imagen` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `precio`, `imagen`) VALUES
(1, 'Naruto Vol. 1', 25000.00, 'productos/naruto-vol1.webp'),
(2, 'One Piece Vol. 1', 28000.00, 'productos/onepiece-vol1.webp'),
(3, 'Attack on Titan Vol. 1', 27000.00, 'productos/aot-vol1.webp'),
(4, 'Demon Slayer Vol. 1', 26000.00, 'productos/demonslayer-vol1.webp'),
(5, 'Jujutsu Kaisen Vol. 1', 29000.00, 'productos/jujutsu-vol1.webp'),
(6, 'Dragon Ball Super Vol. 1', 24000.00, 'productos/dbs-vol1.webp'),
(7, 'Chainsaw Man Vol. 1', 30000.00, 'productos/chainsaw-vol1.webp'),
(8, 'Figura Goku SSJ (20cm)', 120000.00, 'productos/goku-ssj.jpg'),
(9, 'Figura Luffy Gear 5 (25cm)', 150000.00, 'productos/luffy-gear5.jpg'),
(10, 'Figura Mikasa Ackerman', 110000.00, 'productos/mikasa-figura.jpg'),
(11, 'Figura Gojo Satoru (LED)', 180000.00, 'productos/gojo-led.jpg'),
(12, 'Figura Nezuko Kamado', 95000.00, 'productos/nezuko-figura.jpg'),
(13, 'Figura Levi Ackerman', 130000.00, 'productos/levi-figura.jpg'),
(14, 'Figura Tanjiro con Nezuko', 140000.00, 'productos/tanjiro-nezuko.jpg'),
(15, 'Peluche Pikachu (30cm)', 35000.00, 'productos/pikachu-peluche.jpg'),
(16, 'Peluche Totoro Grande', 50000.00, 'productos/totoro-peluche.jpg'),
(17, 'Peluche Kirby', 30000.00, 'productos/kirby-peluche.jpg'),
(18, 'Peluche Hello Kitty', 28000.00, 'productos/kitty-peluche.jpg'),
(19, 'Peluche Sonic', 32000.00, 'productos/sonic-peluche.jpg'),
(20, 'Peluche Doraemon', 40000.00, 'productos/doraemon-peluche.jpg'),
(21, 'Peluche Eevee', 38000.00, 'productos/eevee-peluche.jpg'),
(22, 'Collar de Konoha', 18000.00, 'productos/collar-konoha.jpg'),
(23, 'Anillo Sharingan', 15000.00, 'productos/anillo-sharingan.jpg'),
(24, 'Llavero One Piece', 12000.00, 'productos/llavero-onepiece.jpg'),
(25, 'Aretes Sailor Moon', 22000.00, 'productos/aretes-sailormoon.jpg'),
(26, 'Pulsera Dragon Ball', 10000.00, 'productos/pulsera-dragonball.jpg'),
(27, 'Pin Attack on Titan', 8000.00, 'productos/pin-aot.jpg'),
(28, 'Gorra Naruto', 25000.00, 'productos/gorra-naruto.jpg'),
(29, 'Cuaderno Kimetsu no Yaiba', 12000.00, 'productos/cuaderno-kimetsu.jpg'),
(30, 'Bolígrafo Totoro', 7000.00, 'productos/boligrafo-totoro.jpg'),
(31, 'Set de Notas Studio Ghibli', 15000.00, 'productos/notas-ghibli.jpg'),
(32, 'Mochila My Hero Academia', 85000.00, 'productos/mochila-mha.jpg'),
(33, 'Estuche Jujutsu Kaisen', 20000.00, 'productos/estuche-jujutsu.jpg'),
(34, 'Calculadora Dragon Ball', 30000.00, 'productos/calculadora-db.jpg'),
(35, 'Agenda Tokyo Revengers', 25000.00, 'productos/agenda-tokyo.jpg'),
(36, 'Pocky Chocolate', 9000.00, 'productos/pocky-chocolate.jpg'),
(37, 'Ramen Ichiraku (Pack 3)', 15000.00, 'productos/ramen-ichiraku.jpg'),
(38, 'Kit Kat Matcha', 12000.00, 'productos/kitkat-matcha.jpg'),
(39, 'Mochi de Fresa', 10000.00, 'productos/mochi-fresa.jpg'),
(40, 'Dorayaki (Pack 2)', 8000.00, 'productos/dorayaki-pack.jpg'),
(41, 'Hi-Chew (Variados)', 7000.00, 'productos/hi-chew.jpg'),
(42, 'Calpis Original', 5000.00, 'productos/calpis.jpg'),
(43, 'Camiseta Tokyo Revengers', 40000.00, 'productos/camiseta-tokyo.jpg'),
(44, 'Sudadera My Hero Academia', 70000.00, 'productos/sudadera-mha.jpg'),
(45, 'Buzo Chainsaw Man', 75000.00, 'productos/buzo-chainsaw.jpg'),
(46, 'Pantalón Jujutsu Kaisen', 60000.00, 'productos/pantalon-jujutsu.jpg'),
(47, 'Zapatos Dragon Ball', 90000.00, 'productos/zapatos-dragonball.jpg'),
(48, 'Chaqueta Attack on Titan', 85000.00, 'productos/chaqueta-aot.jpg'),
(49, 'Vestido Sailor Moon', 65000.00, 'productos/vestido-sailormoon.jpg'),
(50, 'Taza Evangelion', 22000.00, 'productos/taza-evangelion.jpg'),
(51, 'Cojín Jujutsu Kaisen', 30000.00, 'productos/cojin-jujutsu.jpg'),
(52, 'Funda de Almohada Ghibli', 35000.00, 'productos/funda-ghibli.jpg'),
(53, 'Alfombra One Piece', 50000.00, 'productos/alfombra-onepiece.jpg'),
(54, 'Lámpara Totoro', 45000.00, 'productos/lampara-totoro.jpg'),
(55, 'Set de Cubiertos Naruto', 28000.00, 'productos/cubiertos-naruto.jpg'),
(56, 'Póster Attack on Titan', 15000.00, 'productos/poster-aot.jpg'),
(57, 'Gantz Vol. 1', 35000.00, 'productos/gantz-vol1.webp');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_categoria`
--

CREATE TABLE `producto_categoria` (
  `id` int(11) NOT NULL,
  `producto_id` int(11) DEFAULT NULL,
  `categoria_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `user_id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `user_mail` varchar(255) NOT NULL,
  `suscrito` bit(1) DEFAULT b'0',
  `google_id` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`user_id`, `username`, `password`, `user_mail`, `suscrito`, `google_id`) VALUES
(1, 'AdminLock', 'Sebastian_0512', 'Johansebasjb@hotmail.com', b'1', NULL),
(2, 'AdminLock2', 'Sebastian_052', 'Johanjb@hotmail.com', b'0', NULL),
(3, 'AdminLock3', 'Sebastian_012', 'Johansebas@hotmail.com', b'0', NULL),
(4, 'AdminLock4', 'Sebastian_512', 'Sebasjb@hotmail.com', b'1', NULL),
(5, 'Johan', '$2a$10$FfHn5aj2ViioRBYKTjfvSuBDVgdJzimN2xwedlk8KXre7fumX3MO6', 'Afabega@hotmail.com', b'0', NULL),
(6, 'Johan Sebastian Jerez Becerra', '', 'johansebastianjerezb@gmail.com', b'0', '110578432553762877500');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `detalle_orden`
--
ALTER TABLE `detalle_orden`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orden_id` (`orden_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `ordenes`
--
ALTER TABLE `ordenes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `producto_categoria`
--
ALTER TABLE `producto_categoria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `producto_id` (`producto_id`),
  ADD KEY `categoria_id` (`categoria_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `user_mail` (`user_mail`),
  ADD UNIQUE KEY `google_id` (`google_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `detalle_orden`
--
ALTER TABLE `detalle_orden`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `ordenes`
--
ALTER TABLE `ordenes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT de la tabla `producto_categoria`
--
ALTER TABLE `producto_categoria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalle_orden`
--
ALTER TABLE `detalle_orden`
  ADD CONSTRAINT `detalle_orden_ibfk_1` FOREIGN KEY (`orden_id`) REFERENCES `ordenes` (`id`),
  ADD CONSTRAINT `detalle_orden_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `ordenes`
--
ALTER TABLE `ordenes`
  ADD CONSTRAINT `ordenes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`user_id`);

--
-- Filtros para la tabla `producto_categoria`
--
ALTER TABLE `producto_categoria`
  ADD CONSTRAINT `producto_categoria_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  ADD CONSTRAINT `producto_categoria_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
