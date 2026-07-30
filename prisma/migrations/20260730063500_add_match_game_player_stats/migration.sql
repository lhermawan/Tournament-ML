-- CreateTable
CREATE TABLE `matchgamestat` (
    `id` VARCHAR(191) NOT NULL,
    `matchGameId` VARCHAR(191) NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `kills` INTEGER NOT NULL DEFAULT 0,
    `deaths` INTEGER NOT NULL DEFAULT 0,
    `assists` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MatchGameStat_matchGameId_playerId_key`(`matchGameId`, `playerId`),
    INDEX `MatchGameStat_playerId_idx`(`playerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `matchgamestat` ADD CONSTRAINT `MatchGameStat_matchGameId_fkey` FOREIGN KEY (`matchGameId`) REFERENCES `matchgame`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matchgamestat` ADD CONSTRAINT `MatchGameStat_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
