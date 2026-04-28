-- Variant support follow-up migration
-- Safe to run after backfilling legacy data.

ALTER TABLE `BookVariant`
  ADD COLUMN `discountPercent` INTEGER NULL;

CREATE UNIQUE INDEX `CartItem_cartId_variantId_key` ON `CartItem`(`cartId`, `variantId`);
CREATE UNIQUE INDEX `Wishlist_userId_variantId_key` ON `Wishlist`(`userId`, `variantId`);
