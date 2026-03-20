/*
  Warnings:

  - You are about to drop the `alembic_version` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "alembic_version";

-- RenameIndex
ALTER INDEX "ix_process_plans_design_rule" RENAME TO "process_plans_design_rule_key";

-- RenameIndex
ALTER INDEX "ix_products_partid" RENAME TO "products_partid_key";
