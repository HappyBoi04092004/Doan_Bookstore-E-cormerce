DELETE FROM `Address`;
DELETE FROM `Ward`;
DELETE FROM `District`;
DELETE FROM `Province`;

ALTER TABLE `Address` DROP FOREIGN KEY `Address_districtCode_fkey`;
ALTER TABLE `Ward` DROP FOREIGN KEY `Ward_districtCode_fkey`;

ALTER TABLE `Address` DROP COLUMN `districtCode`;

ALTER TABLE `Ward`
  DROP COLUMN `districtCode`,
  ADD COLUMN `provinceCode` INTEGER NOT NULL;

CREATE INDEX `Ward_provinceCode_idx` ON `Ward`(`provinceCode`);

ALTER TABLE `Ward` ADD CONSTRAINT `Ward_provinceCode_fkey`
  FOREIGN KEY (`provinceCode`) REFERENCES `Province`(`code`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

DROP TABLE `District`;
