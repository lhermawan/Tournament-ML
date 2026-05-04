-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 04, 2026 at 09:14 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ml_dleague`
--

-- --------------------------------------------------------

--
-- Table structure for table `match`
--

CREATE TABLE `match` (
  `id` varchar(191) NOT NULL,
  `seasonId` varchar(191) NOT NULL,
  `week` int(11) NOT NULL,
  `teamAId` varchar(191) NOT NULL,
  `teamBId` varchar(191) NOT NULL,
  `winnerId` varchar(191) DEFAULT NULL,
  `scoreA` int(11) DEFAULT NULL,
  `scoreB` int(11) DEFAULT NULL,
  `mvpId` varchar(191) DEFAULT NULL,
  `screenshotUrl` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `matchgame`
--

CREATE TABLE `matchgame` (
  `id` varchar(191) NOT NULL,
  `matchId` varchar(191) NOT NULL,
  `gameNumber` int(11) NOT NULL,
  `winnerId` varchar(191) DEFAULT NULL,
  `mvpId` varchar(191) DEFAULT NULL,
  `mvpKills` int(11) NOT NULL DEFAULT 0,
  `mvpDeaths` int(11) NOT NULL DEFAULT 0,
  `mvpAssists` int(11) NOT NULL DEFAULT 0,
  `screenshotUrl` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `player`
--

CREATE TABLE `player` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `nickname` varchar(191) NOT NULL,
  `mlId` varchar(191) NOT NULL,
  `phone` varchar(191) NOT NULL,
  `unit` varchar(191) NOT NULL,
  `rank` enum('Master','Grandmaster','Epic','Legend','Mythic') NOT NULL,
  `mainRole` enum('Jungler','Mid_Lane','Gold_Lane','EXP_Lane','Roamer') NOT NULL,
  `secondRole` enum('Jungler','Mid_Lane','Gold_Lane','EXP_Lane','Roamer') DEFAULT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `player`
--

INSERT INTO `player` (`id`, `userId`, `nickname`, `mlId`, `phone`, `unit`, `rank`, `mainRole`, `secondRole`, `verified`, `createdAt`, `updatedAt`) VALUES
('cmoql1g89000267hwyvy3v884', 'cmoql1g89000167hwxyz3i84y', 'SilentKill', '67458566', '-', 'Peserta sementara', 'Legend', 'EXP_Lane', 'Jungler', 1, '2026-05-04 02:30:46.378', '2026-05-04 03:31:10.102'),
('cmoql1g8i000567hw2ag3ft4c', 'cmoql1g8i000467hwfbsv10hu', 'Kovalski', '68392155', '-', 'Peserta sementara', 'Legend', 'Roamer', 'Gold_Lane', 1, '2026-05-04 02:30:46.386', '2026-05-04 03:31:10.102'),
('cmoql1g8n000867hwjqsl43f8', 'cmoql1g8m000767hw19sfe9b9', 'ARISEDANTE.', '55196663', '-', 'Peserta sementara', 'Mythic', 'Jungler', 'Gold_Lane', 1, '2026-05-04 02:30:46.391', '2026-05-04 03:31:10.102'),
('cmoql1g8t000b67hwj4eo60si', 'cmoql1g8t000a67hwrpsk1ig2', 'BANGZ•Bie', '55120108', '-', 'Peserta sementara', 'Mythic', 'Gold_Lane', 'Roamer', 1, '2026-05-04 02:30:46.397', '2026-05-04 03:31:10.102'),
('cmoql1g8w000e67hwqcf2vvi1', 'cmoql1g8w000d67hwi43ri89d', 'Wanzhead', '158353311', '-', 'Peserta sementara', 'Epic', 'Roamer', 'Gold_Lane', 1, '2026-05-04 02:30:46.401', '2026-05-04 03:31:10.102'),
('cmoql1g8z000h67hw9kn1nfjl', 'cmoql1g8z000g67hwanfu8v9c', 'Aqua Vites', 'Belum diisi', '-', 'Peserta sementara', 'Legend', 'Mid_Lane', 'Gold_Lane', 1, '2026-05-04 02:30:46.404', '2026-05-04 03:31:10.102'),
('cmoql1g92000k67hwtxwrcvmg', 'cmoql1g92000j67hwx2b2jegm', 'Poss1bility', '28473195 (2038)', '-', 'Peserta sementara', 'Legend', 'Mid_Lane', 'EXP_Lane', 1, '2026-05-04 02:30:46.407', '2026-05-04 03:31:10.102'),
('cmoql1g95000n67hwftxbj4dl', 'cmoql1g95000m67hwlim5f8cf', 'Icarus.Falls', '210586326', '-', 'Peserta sementara', 'Legend', 'Roamer', 'Mid_Lane', 1, '2026-05-04 02:30:46.410', '2026-05-04 03:31:10.102'),
('cmoql1g98000q67hwdad8i0q0', 'cmoql1g98000p67hwftnyo5de', 'Amayu', '1290948778', '-', 'Peserta sementara', 'Legend', 'Gold_Lane', 'Mid_Lane', 1, '2026-05-04 02:30:46.413', '2026-05-04 03:31:10.102'),
('cmoql1g9b000t67hweerp0mao', 'cmoql1g9b000s67hwusxkv56u', 'AlegrE', 'Belum diisi', '-', 'Peserta sementara', 'Epic', 'EXP_Lane', 'EXP_Lane', 1, '2026-05-04 02:30:46.416', '2026-05-04 03:31:10.102'),
('cmoql1g9e000w67hwinf6xchj', 'cmoql1g9e000v67hw4xbtes3d', 'Z A N N', 'Belum diisi', '-', 'Peserta sementara', 'Legend', 'Mid_Lane', 'Gold_Lane', 1, '2026-05-04 02:30:46.418', '2026-05-04 03:31:10.102'),
('cmoql1g9h000z67hw526l4yx5', 'cmoql1g9h000y67hwa9t880bj', 'bonazkamizuka', '189919847', '-', 'Peserta sementara', 'Mythic', 'EXP_Lane', 'Roamer', 1, '2026-05-04 02:30:46.421', '2026-05-04 03:31:10.102'),
('cmoql1g9l001267hwclb9w3ef', 'cmoql1g9l001167hwowkyrl50', 'CIAMIS<3', '194472828 (9010)', '-', 'Peserta sementara', 'Legend', 'EXP_Lane', 'Roamer', 1, '2026-05-04 02:30:46.425', '2026-05-04 03:31:10.102'),
('cmoql1g9o001567hwem9kq5pi', 'cmoql1g9o001467hw4y0vf5sx', 'AKU DAN 4 ORANG PEA', '102449613 (2526)', '-', 'Peserta sementara', 'Legend', 'Roamer', 'Gold_Lane', 1, '2026-05-04 02:30:46.429', '2026-05-04 03:31:10.102'),
('cmoql1g9s001867hw3fa9rheb', 'cmoql1g9s001767hw228jxft6', 'Burung Indah', '891017717 (12538)', '-', 'Peserta sementara', 'Legend', 'Gold_Lane', 'Mid_Lane', 1, '2026-05-04 02:30:46.432', '2026-05-04 03:31:10.102'),
('cmoql1g9v001b67hwqkgxvhxy', 'cmoql1g9v001a67hw6vsoirfj', 'NOOB SEKALI', '945338412 (12746)', '-', 'Peserta sementara', 'Legend', 'Mid_Lane', 'Jungler', 1, '2026-05-04 02:30:46.435', '2026-05-04 03:31:10.102'),
('cmoqn36pu000ufnnhseo0j8xu', 'cmoqn36pu000tfnnhq9hn82hy', 'AMPUN OM', '126367809', '08112474879', 'Peserta sementara', 'Legend', 'Mid_Lane', 'Jungler', 1, '2026-05-04 03:28:06.595', '2026-05-04 03:31:10.102'),
('cmoqn6nbo000wfnnhrcii449s', 'cmoqn6nbo000vfnnhf4u74j98', 'wumbo', '80816206', '085123123123', 'Peserta sementara', 'Mythic', 'Jungler', 'EXP_Lane', 1, '2026-05-04 03:30:48.084', '2026-05-04 03:31:10.102'),
('cmoqrqkee0003jo5vkqxaf9oy', 'cmoqrqkee0002jo5vfdi3j1nq', '[G.A] Gendot', '43030463', '081321425000', 'Peserta sementara', 'Mythic', 'Roamer', 'Mid_Lane', 1, '2026-05-04 05:38:15.878', '2026-05-04 05:38:15.878'),
('cmoqrsl5l0005jo5vr8wuevvv', 'cmoqrsl5l0004jo5vwxnvrjjx', 'HAAHH!!', '546957024', '020202020', 'Peserta sementara', 'Mythic', 'Gold_Lane', 'Mid_Lane', 1, '2026-05-04 05:39:50.169', '2026-05-04 05:39:50.169');

-- --------------------------------------------------------

--
-- Table structure for table `season`
--

CREATE TABLE `season` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `status` enum('draft','registration','locked','league','playoff','completed') NOT NULL DEFAULT 'draft',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `season`
--

INSERT INTO `season` (`id`, `name`, `status`, `createdAt`, `updatedAt`) VALUES
('cmoqpvx5v0003vhwgdi13x3pe', 'Season Internal 2026', 'draft', '2026-05-04 04:46:26.467', '2026-05-04 04:46:26.467');

-- --------------------------------------------------------

--
-- Table structure for table `team`
--

CREATE TABLE `team` (
  `id` varchar(191) NOT NULL,
  `seasonId` varchar(191) NOT NULL,
  `teamName` varchar(191) NOT NULL,
  `power` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teammember`
--

CREATE TABLE `teammember` (
  `id` varchar(191) NOT NULL,
  `teamId` varchar(191) NOT NULL,
  `playerId` varchar(191) NOT NULL,
  `laneRole` enum('Jungler','Mid_Lane','Gold_Lane','EXP_Lane','Roamer') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role` enum('admin','player') NOT NULL DEFAULT 'player',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `name`, `email`, `password`, `role`, `createdAt`, `updatedAt`) VALUES
('cmoqks9st0000ig62nebbhgo7', 'Admin Diskominfo', 'admin@diskominfo.local', '$2a$10$1LFeLZ/K6eCR8RtRGBnrXeL7DDm.M5M5WS09R7Fa.5NR8hEFqr3sC', 'admin', '2026-05-04 02:23:38.139', '2026-05-04 02:30:46.371'),
('cmoql1g89000167hwxyz3i84y', 'Lucky', 'lucky@peserta.local', '$2a$10$bWdYyTn8ftIGmr8kzB9tS.mmEn1nllxPUnCSW0aq70iXenJDDSV9C', 'player', '2026-05-04 02:30:46.378', '2026-05-04 02:30:46.378'),
('cmoql1g8i000467hwfbsv10hu', 'Ujang', 'ujang@peserta.local', '$2a$10$bWdYyTn8ftIGmr8kzB9tS.mmEn1nllxPUnCSW0aq70iXenJDDSV9C', 'player', '2026-05-04 02:30:46.386', '2026-05-04 02:30:46.386'),
('cmoql1g8m000767hw19sfe9b9', 'Ramdan', 'ramdan@peserta.local', '$2a$10$bWdYyTn8ftIGmr8kzB9tS.mmEn1nllxPUnCSW0aq70iXenJDDSV9C', 'player', '2026-05-04 02:30:46.391', '2026-05-04 02:30:46.391'),
('cmoql1g8t000a67hwrpsk1ig2', 'Okky', 'okky@peserta.local', '$2a$10$bWdYyTn8ftIGmr8kzB9tS.mmEn1nllxPUnCSW0aq70iXenJDDSV9C', 'player', '2026-05-04 02:30:46.397', '2026-05-04 02:30:46.397'),
('cmoql1g8w000d67hwi43ri89d', 'Iwong', 'iwong@peserta.local', '$2a$10$bWdYyTn8ftIGmr8kzB9tS.mmEn1nllxPUnCSW0aq70iXenJDDSV9C', 'player', '2026-05-04 02:30:46.401', '2026-05-04 02:30:46.401'),
('cmoql1g8z000g67hwanfu8v9c', 'Pipic', 'pipic@peserta.local', '$2a$10$bWdYyTn8ftIGmr8kzB9tS.mmEn1nllxPUnCSW0aq70iXenJDDSV9C', 'player', '2026-05-04 02:30:46.404', '2026-05-04 02:30:46.404'),
('cmoql1g92000j67hwx2b2jegm', 'Bimo', 'bimo@peserta.local', '$2a$10$bWdYyTn8ftIGmr8kzB9tS.mmEn1nllxPUnCSW0aq70iXenJDDSV9C', 'player', '2026-05-04 02:30:46.407', '2026-05-04 02:30:46.407'),
('cmoql1g95000m67hwlim5f8cf', 'Kanjeng Dimas', 'kanjeng.dimas@peserta.local', '$2a$10$bWdYyTn8ftIGmr8kzB9tS.mmEn1nllxPUnCSW0aq70iXenJDDSV9C', 'player', '2026-05-04 02:30:46.410', '2026-05-04 02:30:46.410'),
('cmoql1g98000p67hwftnyo5de', 'Acep', 'acep@peserta.local', '$2a$10$bWdYyTn8ftIGmr8kzB9tS.mmEn1nllxPUnCSW0aq70iXenJDDSV9C', 'player', '2026-05-04 02:30:46.413', '2026-05-04 02:30:46.413'),
('cmoql1g9b000s67hwusxkv56u', 'Adam x Ica', 'adam.ica@peserta.local', '$2a$10$bWdYyTn8ftIGmr8kzB9tS.mmEn1nllxPUnCSW0aq70iXenJDDSV9C', 'player', '2026-05-04 02:30:46.416', '2026-05-04 02:30:46.416'),
('cmoql1g9e000v67hw4xbtes3d', 'Razzan', 'razzan@peserta.local', '$2a$10$bWdYyTn8ftIGmr8kzB9tS.mmEn1nllxPUnCSW0aq70iXenJDDSV9C', 'player', '2026-05-04 02:30:46.418', '2026-05-04 02:30:46.418'),
('cmoql1g9h000y67hwa9t880bj', 'Gagah', 'gagah@peserta.local', '$2a$10$bWdYyTn8ftIGmr8kzB9tS.mmEn1nllxPUnCSW0aq70iXenJDDSV9C', 'player', '2026-05-04 02:30:46.421', '2026-05-04 02:30:46.421'),
('cmoql1g9l001167hwowkyrl50', 'Antosyah', 'antosyah@peserta.local', '$2a$10$bWdYyTn8ftIGmr8kzB9tS.mmEn1nllxPUnCSW0aq70iXenJDDSV9C', 'player', '2026-05-04 02:30:46.425', '2026-05-04 02:30:46.425'),
('cmoql1g9o001467hw4y0vf5sx', 'A\' Fey', 'afey@peserta.local', '$2a$10$bWdYyTn8ftIGmr8kzB9tS.mmEn1nllxPUnCSW0aq70iXenJDDSV9C', 'player', '2026-05-04 02:30:46.429', '2026-05-04 02:30:46.429'),
('cmoql1g9s001767hw228jxft6', 'Asep Eful', 'asep.eful@peserta.local', '$2a$10$bWdYyTn8ftIGmr8kzB9tS.mmEn1nllxPUnCSW0aq70iXenJDDSV9C', 'player', '2026-05-04 02:30:46.432', '2026-05-04 02:30:46.432'),
('cmoql1g9v001a67hw6vsoirfj', 'Ifan Ramdani', 'ifan.ramdani@peserta.local', '$2a$10$bWdYyTn8ftIGmr8kzB9tS.mmEn1nllxPUnCSW0aq70iXenJDDSV9C', 'player', '2026-05-04 02:30:46.435', '2026-05-04 02:30:46.435'),
('cmoqn36pu000tfnnhq9hn82hy', 'Oliver Khün', 'kankan@diskominfo.local', '$2a$10$47Goxs7UTGz1YrNpihBPTOMmr5nZICYm.uP/CIURokP/.NjFRXxlm', 'player', '2026-05-04 03:28:06.595', '2026-05-04 03:28:06.595'),
('cmoqn6nbo000vfnnhf4u74j98', 'Satria', 'satria@diskominfo.local', '$2a$10$.nTBY/g.Bx/tzFx2vda0Ye5cA0bVxPayfpQtoiC7H/W9rp.4C9jS2', 'player', '2026-05-04 03:30:48.084', '2026-05-04 03:30:48.084'),
('cmoqrqkee0002jo5vfdi3j1nq', 'Andrew', 'andrew@peserta.local', '$2a$10$eyD5plNOmt580MhyU9lq3uKLWuBP6b.qUsOe1u4OHVxGOr4RGpw4O', 'player', '2026-05-04 05:38:15.878', '2026-05-04 05:38:15.878'),
('cmoqrsl5l0004jo5vwxnvrjjx', 'haidar', 'haidar@peserta.local', '$2a$10$lLaM6.EI0wyRKgaa23eov.vfM7W.dsnmBtfg.K.tEx/.6NJmJEPW.', 'player', '2026-05-04 05:39:50.169', '2026-05-04 05:39:50.169');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('11316cb7-16f0-47bb-b049-85bcb077ce59', '5a6c256041ebdc376884a4a54eb257f142da497387b659b3eb1c34c5922b3d74', '2026-05-04 02:10:48.761', '20260504021048_init', NULL, NULL, '2026-05-04 02:10:48.221', 1),
('9b3fcf8a-0d50-4225-a3c6-8fa3d9b7cac9', 'f02856b6d25149e82eda52ea693e922146b6d5baab0c72229838973dee2776ac', '2026-05-04 04:12:32.656', '20260504041232_add_match_game_stats', NULL, NULL, '2026-05-04 04:12:32.439', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `match`
--
ALTER TABLE `match`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Match_seasonId_idx` (`seasonId`),
  ADD KEY `Match_teamAId_fkey` (`teamAId`),
  ADD KEY `Match_teamBId_fkey` (`teamBId`),
  ADD KEY `Match_winnerId_fkey` (`winnerId`),
  ADD KEY `Match_mvpId_fkey` (`mvpId`);

--
-- Indexes for table `matchgame`
--
ALTER TABLE `matchgame`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `MatchGame_matchId_gameNumber_key` (`matchId`,`gameNumber`),
  ADD KEY `MatchGame_mvpId_idx` (`mvpId`),
  ADD KEY `MatchGame_winnerId_idx` (`winnerId`);

--
-- Indexes for table `player`
--
ALTER TABLE `player`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Player_userId_key` (`userId`);

--
-- Indexes for table `season`
--
ALTER TABLE `season`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `team`
--
ALTER TABLE `team`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Team_seasonId_idx` (`seasonId`);

--
-- Indexes for table `teammember`
--
ALTER TABLE `teammember`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `TeamMember_teamId_laneRole_key` (`teamId`,`laneRole`),
  ADD UNIQUE KEY `TeamMember_teamId_playerId_key` (`teamId`,`playerId`),
  ADD KEY `TeamMember_playerId_fkey` (`playerId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `match`
--
ALTER TABLE `match`
  ADD CONSTRAINT `Match_mvpId_fkey` FOREIGN KEY (`mvpId`) REFERENCES `player` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Match_seasonId_fkey` FOREIGN KEY (`seasonId`) REFERENCES `season` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Match_teamAId_fkey` FOREIGN KEY (`teamAId`) REFERENCES `team` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Match_teamBId_fkey` FOREIGN KEY (`teamBId`) REFERENCES `team` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Match_winnerId_fkey` FOREIGN KEY (`winnerId`) REFERENCES `team` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `matchgame`
--
ALTER TABLE `matchgame`
  ADD CONSTRAINT `MatchGame_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `match` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `MatchGame_mvpId_fkey` FOREIGN KEY (`mvpId`) REFERENCES `player` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `MatchGame_winnerId_fkey` FOREIGN KEY (`winnerId`) REFERENCES `team` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `player`
--
ALTER TABLE `player`
  ADD CONSTRAINT `Player_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `team`
--
ALTER TABLE `team`
  ADD CONSTRAINT `Team_seasonId_fkey` FOREIGN KEY (`seasonId`) REFERENCES `season` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `teammember`
--
ALTER TABLE `teammember`
  ADD CONSTRAINT `TeamMember_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `player` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `TeamMember_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `team` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
