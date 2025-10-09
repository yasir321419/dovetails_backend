/*
  Warnings:

  - You are about to alter the column `name` on the `Category` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(4))`.

*/
-- AlterTable
ALTER TABLE `Category` MODIFY `name` ENUM('FURNITURE', 'LIGHTNING', 'DECOR', 'FLOORING') NOT NULL;
