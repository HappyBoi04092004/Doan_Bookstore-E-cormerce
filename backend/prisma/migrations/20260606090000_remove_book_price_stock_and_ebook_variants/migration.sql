-- Remove deprecated book-level inventory fields. Price and stock live on BookVariant.
ALTER TABLE `Book` DROP COLUMN `price`, DROP COLUMN `stock`;

-- Remove e-book variants from non-order data first.
INSERT INTO `BookVariant` (`bookId`, `name`, `sku`, `price`, `stock`)
SELECT eb.`bookId`, 'Bản tiêu chuẩn', NULL, MIN(eb.`price`), SUM(eb.`stock`)
FROM `BookVariant` eb
WHERE LOWER(eb.`name`) IN ('ebook', 'e-book')
  AND NOT EXISTS (
    SELECT 1
    FROM `BookVariant` replacement
    WHERE replacement.`bookId` = eb.`bookId`
      AND LOWER(replacement.`name`) NOT IN ('ebook', 'e-book')
  )
GROUP BY eb.`bookId`;

UPDATE `OrderItem` oi
INNER JOIN `BookVariant` eb ON eb.`id` = oi.`variantId`
INNER JOIN (
  SELECT `bookId`, MIN(`id`) AS `replacementId`
  FROM `BookVariant`
  WHERE LOWER(`name`) NOT IN ('ebook', 'e-book')
  GROUP BY `bookId`
) replacement ON replacement.`bookId` = eb.`bookId`
SET oi.`variantId` = replacement.`replacementId`
WHERE LOWER(eb.`name`) IN ('ebook', 'e-book');

DELETE ci
FROM `CartItem` ci
INNER JOIN `BookVariant` bv ON bv.`id` = ci.`variantId`
WHERE LOWER(bv.`name`) IN ('ebook', 'e-book');

DELETE w
FROM `Wishlist` w
INNER JOIN `BookVariant` bv ON bv.`id` = w.`variantId`
WHERE LOWER(bv.`name`) IN ('ebook', 'e-book');

UPDATE `ImportReceiptDetail` ird
INNER JOIN `BookVariant` bv ON bv.`id` = ird.`variantId`
SET ird.`variantId` = NULL
WHERE LOWER(bv.`name`) IN ('ebook', 'e-book');

UPDATE `BookImage` bi
INNER JOIN `BookVariant` bv ON bv.`id` = bi.`variantId`
SET bi.`variantId` = NULL
WHERE LOWER(bv.`name`) IN ('ebook', 'e-book');

DELETE bv
FROM `BookVariant` bv
WHERE LOWER(bv.`name`) IN ('ebook', 'e-book')
  AND NOT EXISTS (
    SELECT 1 FROM `OrderItem` oi WHERE oi.`variantId` = bv.`id`
  );
