ALTER TABLE `ImportReceiptDetail` ADD COLUMN `variantId` INTEGER NULL;

UPDATE `ImportReceiptDetail` ird
LEFT JOIN (
  SELECT bv1.`id`, bv1.`bookId`
  FROM `BookVariant` bv1
  INNER JOIN (
    SELECT `bookId`, MIN(`id`) AS `id`
    FROM `BookVariant`
    WHERE LOWER(`name`) NOT LIKE '%ebook%' AND LOWER(`name`) NOT LIKE '%e-book%'
    GROUP BY `bookId`
  ) selected ON selected.`id` = bv1.`id`
) standardVariant ON standardVariant.`bookId` = ird.`productId`
SET ird.`variantId` = standardVariant.`id`
WHERE ird.`variantId` IS NULL;

CREATE INDEX `ImportReceiptDetail_variantId_idx` ON `ImportReceiptDetail`(`variantId`);
ALTER TABLE `ImportReceiptDetail` ADD CONSTRAINT `ImportReceiptDetail_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `BookVariant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
