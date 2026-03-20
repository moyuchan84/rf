/*
  Warnings:

  - You are about to drop the column `created_at` on the `product_meta` table. All the data in the column will be lost.
  - You are about to drop the column `update_time` on the `product_meta` table. All the data in the column will be lost.
  - You are about to drop the column `request_type` on the `request_items` table. All the data in the column will be lost.
  - You are about to drop the `_KeyDesignToProcessPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `key_designs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `request_assignees` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `request_steps` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `request_tables_map` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reticle_layouts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stream_info` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_KeyDesignToProcessPlan" DROP CONSTRAINT "_KeyDesignToProcessPlan_A_fkey";

-- DropForeignKey
ALTER TABLE "_KeyDesignToProcessPlan" DROP CONSTRAINT "_KeyDesignToProcessPlan_B_fkey";

-- DropForeignKey
ALTER TABLE "beol_options" DROP CONSTRAINT "beol_options_process_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "photo_keys" DROP CONSTRAINT "photo_keys_beol_option_id_fkey";

-- DropForeignKey
ALTER TABLE "photo_keys" DROP CONSTRAINT "photo_keys_process_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "photo_keys" DROP CONSTRAINT "photo_keys_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_meta" DROP CONSTRAINT "product_meta_product_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_beol_option_id_fkey";

-- DropForeignKey
ALTER TABLE "request_assignees" DROP CONSTRAINT "request_assignees_request_id_fkey";

-- DropForeignKey
ALTER TABLE "request_items" DROP CONSTRAINT "request_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "request_steps" DROP CONSTRAINT "request_steps_request_id_fkey";

-- DropForeignKey
ALTER TABLE "request_tables_map" DROP CONSTRAINT "request_tables_map_photo_key_id_fkey";

-- DropForeignKey
ALTER TABLE "request_tables_map" DROP CONSTRAINT "request_tables_map_request_id_fkey";

-- DropForeignKey
ALTER TABLE "reticle_layouts" DROP CONSTRAINT "reticle_layouts_product_id_fkey";

-- DropForeignKey
ALTER TABLE "stream_info" DROP CONSTRAINT "stream_info_request_id_fkey";

-- DropIndex
DROP INDEX "beol_options_process_plan_id_option_name_key";

-- AlterTable
ALTER TABLE "beol_options" ALTER COLUMN "option_name" DROP NOT NULL,
ALTER COLUMN "option_name" SET DATA TYPE VARCHAR,
ALTER COLUMN "process_plan_id" DROP NOT NULL,
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "update_time" DROP NOT NULL,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "photo_keys" ADD COLUMN     "raw_binary" BYTEA,
ALTER COLUMN "product_id" DROP NOT NULL,
ALTER COLUMN "rfg_category" SET DATA TYPE VARCHAR,
ALTER COLUMN "photo_category" SET DATA TYPE VARCHAR,
ALTER COLUMN "is_reference" DROP NOT NULL,
ALTER COLUMN "table_name" DROP NOT NULL,
ALTER COLUMN "table_name" SET DATA TYPE VARCHAR,
ALTER COLUMN "rev_no" DROP NOT NULL,
ALTER COLUMN "workbook_data" SET DATA TYPE JSON,
ALTER COLUMN "filename" SET DATA TYPE VARCHAR,
ALTER COLUMN "updater" SET DATA TYPE VARCHAR,
ALTER COLUMN "update_date" DROP NOT NULL,
ALTER COLUMN "update_date" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "process_plans" ALTER COLUMN "design_rule" DROP NOT NULL,
ALTER COLUMN "design_rule" SET DATA TYPE VARCHAR,
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "update_time" DROP NOT NULL,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "product_meta" DROP COLUMN "created_at",
DROP COLUMN "update_time",
ALTER COLUMN "product_id" DROP NOT NULL,
ALTER COLUMN "process_id" SET DATA TYPE VARCHAR,
ALTER COLUMN "customer" SET DATA TYPE VARCHAR,
ALTER COLUMN "application" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "partid" DROP NOT NULL,
ALTER COLUMN "partid" SET DATA TYPE VARCHAR,
ALTER COLUMN "product_name" DROP NOT NULL,
ALTER COLUMN "product_name" SET DATA TYPE VARCHAR,
ALTER COLUMN "beol_option_id" DROP NOT NULL,
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "update_time" DROP NOT NULL,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "request_items" DROP COLUMN "request_type",
ALTER COLUMN "product_id" DROP NOT NULL,
ALTER COLUMN "title" SET DATA TYPE VARCHAR,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "edm_list" SET DATA TYPE VARCHAR[],
ALTER COLUMN "pkd_versions" SET DATA TYPE VARCHAR[],
ALTER COLUMN "requester_id" SET DATA TYPE VARCHAR,
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "update_time" DROP NOT NULL,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DATA TYPE TIMESTAMPTZ(6);

-- DropTable
DROP TABLE "_KeyDesignToProcessPlan";

-- DropTable
DROP TABLE "key_designs";

-- DropTable
DROP TABLE "request_assignees";

-- DropTable
DROP TABLE "request_steps";

-- DropTable
DROP TABLE "request_tables_map";

-- DropTable
DROP TABLE "reticle_layouts";

-- DropTable
DROP TABLE "stream_info";

-- CreateTable
CREATE TABLE "alembic_version" (
    "version_num" VARCHAR(32) NOT NULL,

    CONSTRAINT "alembic_version_pkc" PRIMARY KEY ("version_num")
);

-- CreateIndex
CREATE INDEX "ix_beol_options_id" ON "beol_options"("id");

-- CreateIndex
CREATE INDEX "ix_beol_options_option_name" ON "beol_options"("option_name");

-- CreateIndex
CREATE INDEX "ix_photo_keys_id" ON "photo_keys"("id");

-- CreateIndex
CREATE INDEX "ix_process_plans_id" ON "process_plans"("id");

-- CreateIndex
CREATE INDEX "ix_product_meta_id" ON "product_meta"("id");

-- CreateIndex
CREATE INDEX "ix_products_id" ON "products"("id");

-- CreateIndex
CREATE INDEX "ix_products_product_name" ON "products"("product_name");

-- CreateIndex
CREATE INDEX "ix_request_items_id" ON "request_items"("id");

-- AddForeignKey
ALTER TABLE "beol_options" ADD CONSTRAINT "beol_options_process_plan_id_fkey" FOREIGN KEY ("process_plan_id") REFERENCES "process_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_beol_option_id_fkey" FOREIGN KEY ("beol_option_id") REFERENCES "beol_options"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_meta" ADD CONSTRAINT "product_meta_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "request_items" ADD CONSTRAINT "request_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo_keys" ADD CONSTRAINT "photo_keys_beol_option_id_fkey" FOREIGN KEY ("beol_option_id") REFERENCES "beol_options"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo_keys" ADD CONSTRAINT "photo_keys_process_plan_id_fkey" FOREIGN KEY ("process_plan_id") REFERENCES "process_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo_keys" ADD CONSTRAINT "photo_keys_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- RenameIndex
ALTER INDEX "process_plans_design_rule_key" RENAME TO "ix_process_plans_design_rule";

-- RenameIndex
ALTER INDEX "products_partid_key" RENAME TO "ix_products_partid";
