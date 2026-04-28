-- Migration: add_book_images_and_attributes
-- Step 1: Create new tables FIRST (before dropping the image column)

-- CreateTable BookImage
CREATE TABLE `BookImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookId` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `altText` VARCHAR(191) NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    INDEX `BookImage_bookId_idx`(`bookId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable Attribute
CREATE TABLE `Attribute` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `unit` VARCHAR(191) NULL,
    UNIQUE INDEX `Attribute_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable BookAttribute
CREATE TABLE `BookAttribute` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookId` INTEGER NOT NULL,
    `attributeId` INTEGER NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    INDEX `BookAttribute_bookId_idx`(`bookId`),
    INDEX `BookAttribute_attributeId_idx`(`attributeId`),
    UNIQUE INDEX `BookAttribute_bookId_attributeId_key`(`bookId`, `attributeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 2: Migrate existing image data from Book.image -> BookImage
INSERT INTO `BookImage` (`bookId`, `url`, `isPrimary`, `sortOrder`)
SELECT `id`, `image`, true, 0
FROM `Book`
WHERE `image` IS NOT NULL AND `image` != '';

-- Step 3: Now safe to drop the old image column
ALTER TABLE `Book` DROP COLUMN `image`;

-- Step 4: Add foreign keys
ALTER TABLE `BookImage` ADD CONSTRAINT `BookImage_bookId_fkey`
    FOREIGN KEY (`bookId`) REFERENCES `Book`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `BookAttribute` ADD CONSTRAINT `BookAttribute_bookId_fkey`
    FOREIGN KEY (`bookId`) REFERENCES `Book`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `BookAttribute` ADD CONSTRAINT `BookAttribute_attributeId_fkey`
    FOREIGN KEY (`attributeId`) REFERENCES `Attribute`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 5: Seed default Attribute definitions
INSERT INTO `Attribute` (`name`, `unit`) VALUES
    ('Ngôn ngữ',       NULL),
    ('Định dạng',      NULL),
    ('Nhà xuất bản',   NULL),
    ('Số trang',       'trang'),
    ('ISBN',           NULL),
    ('Năm xuất bản',   NULL);
