-- CreateTable
CREATE TABLE `MatchGame` (
    `id` VARCHAR(191) NOT NULL,
    `matchId` VARCHAR(191) NOT NULL,
    `gameNumber` INTEGER NOT NULL,
    `winnerId` VARCHAR(191) NULL,
    `mvpId` VARCHAR(191) NULL,
    `mvpKills` INTEGER NOT NULL DEFAULT 0,
    `mvpDeaths` INTEGER NOT NULL DEFAULT 0,
    `mvpAssists` INTEGER NOT NULL DEFAULT 0,
    `screenshotUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MatchGame_mvpId_idx`(`mvpId`),
    INDEX `MatchGame_winnerId_idx`(`winnerId`),
    UNIQUE INDEX `MatchGame_matchId_gameNumber_key`(`matchId`, `gameNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MatchGame` ADD CONSTRAINT `MatchGame_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchGame` ADD CONSTRAINT `MatchGame_winnerId_fkey` FOREIGN KEY (`winnerId`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatchGame` ADD CONSTRAINT `MatchGame_mvpId_fkey` FOREIGN KEY (`mvpId`) REFERENCES `Player`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
