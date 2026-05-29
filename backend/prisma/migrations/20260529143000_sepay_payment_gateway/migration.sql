ALTER TABLE `Order`
  ADD COLUMN `invoiceNumber` VARCHAR(191) NULL,
  ADD COLUMN `currency` VARCHAR(191) NOT NULL DEFAULT 'VND',
  ADD COLUMN `orderStatus` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);

CREATE UNIQUE INDEX `Order_invoiceNumber_key` ON `Order`(`invoiceNumber`);

ALTER TABLE `Payment`
  ADD COLUMN `currency` VARCHAR(191) NOT NULL DEFAULT 'VND',
  ADD COLUMN `invoiceNumber` VARCHAR(191) NULL,
  ADD COLUMN `paymentUrl` TEXT NULL,
  ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);

CREATE UNIQUE INDEX `Payment_invoiceNumber_key` ON `Payment`(`invoiceNumber`);

CREATE TABLE `PaymentTransaction` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `orderId` INTEGER NOT NULL,
  `paymentId` INTEGER NULL,
  `transactionId` VARCHAR(191) NULL,
  `invoiceNumber` VARCHAR(191) NOT NULL,
  `amount` INTEGER NOT NULL,
  `currency` VARCHAR(191) NOT NULL DEFAULT 'VND',
  `paymentMethod` VARCHAR(191) NOT NULL DEFAULT 'SEPAY',
  `transactionStatus` VARCHAR(191) NOT NULL,
  `notificationType` VARCHAR(191) NULL,
  `rawPayload` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `PaymentTransaction_orderId_idx`(`orderId`),
  INDEX `PaymentTransaction_paymentId_idx`(`paymentId`),
  INDEX `PaymentTransaction_invoiceNumber_idx`(`invoiceNumber`),
  INDEX `PaymentTransaction_transactionId_idx`(`transactionId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `PaymentTransaction`
  ADD CONSTRAINT `PaymentTransaction_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `PaymentTransaction`
  ADD CONSTRAINT `PaymentTransaction_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
