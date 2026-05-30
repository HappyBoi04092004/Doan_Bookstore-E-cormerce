-- Add fixed book detail fields directly to Book.
ALTER TABLE `Book`
  ADD COLUMN `publisher` VARCHAR(191) NOT NULL DEFAULT '',
  ADD COLUMN `isbn` VARCHAR(191) NULL,
  ADD COLUMN `publishYear` INTEGER NULL,
  ADD COLUMN `pageCount` INTEGER NULL,
  ADD COLUMN `language` VARCHAR(191) NULL,
  ADD COLUMN `size` VARCHAR(191) NULL,
  ADD COLUMN `format` VARCHAR(191) NULL;

-- Backfill publisher from the existing publisher relation when available.
UPDATE `Book` b
LEFT JOIN `Publisher` p ON p.`id` = b.`publisherId`
SET b.`publisher` = COALESCE(p.`name`, b.`publisher`, '');

-- Backfill known dynamic attributes into the new columns before removing EAV tables.
UPDATE `Book` b
JOIN `BookAttribute` ba ON ba.`bookId` = b.`id`
JOIN `Attribute` a ON a.`id` = ba.`attributeId`
SET b.`isbn` = ba.`value`
WHERE LOWER(a.`name`) IN ('isbn');

UPDATE `Book` b
JOIN `BookAttribute` ba ON ba.`bookId` = b.`id`
JOIN `Attribute` a ON a.`id` = ba.`attributeId`
SET b.`publishYear` = CAST(NULLIF(REGEXP_REPLACE(ba.`value`, '[^0-9]', ''), '') AS UNSIGNED)
WHERE LOWER(a.`name`) IN ('publishyear', 'publish year', 'publication year', 'year', 'nam xuat ban', 'năm xuất bản');

UPDATE `Book` b
JOIN `BookAttribute` ba ON ba.`bookId` = b.`id`
JOIN `Attribute` a ON a.`id` = ba.`attributeId`
SET b.`pageCount` = CAST(NULLIF(REGEXP_REPLACE(ba.`value`, '[^0-9]', ''), '') AS UNSIGNED)
WHERE LOWER(a.`name`) IN ('pagecount', 'page count', 'pages', 'so trang', 'số trang');

UPDATE `Book` b
JOIN `BookAttribute` ba ON ba.`bookId` = b.`id`
JOIN `Attribute` a ON a.`id` = ba.`attributeId`
SET b.`language` = ba.`value`
WHERE LOWER(a.`name`) IN ('language', 'ngon ngu', 'ngôn ngữ');

UPDATE `Book` b
JOIN `BookAttribute` ba ON ba.`bookId` = b.`id`
JOIN `Attribute` a ON a.`id` = ba.`attributeId`
SET b.`size` = ba.`value`
WHERE LOWER(a.`name`) IN ('size', 'kich thuoc', 'kích thước');

UPDATE `Book` b
JOIN `BookAttribute` ba ON ba.`bookId` = b.`id`
JOIN `Attribute` a ON a.`id` = ba.`attributeId`
SET b.`format` = ba.`value`
WHERE LOWER(a.`name`) IN ('format', 'dinh dang', 'định dạng');

DROP TABLE `BookAttribute`;
DROP TABLE `Attribute`;
