/*
  Warnings:

  - You are about to drop the column `process_plan_id` on the `beol_options` table. All the data in the column will be lost.
  - You are about to drop the column `beol_option_id` on the `gds_path_info` table. All the data in the column will be lost.
  - You are about to drop the column `beol_option_id` on the `photo_keys` table. All the data in the column will be lost.
  - You are about to drop the column `beol_option_id` on the `request_table_maps` table. All the data in the column will be lost.
  - You are about to drop the column `beol_option_id` on the `reticle_layouts` table. All the data in the column will be lost.
  - You are about to drop the column `beol_option_id` on the `stream_info` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "beol_options" DROP CONSTRAINT "beol_options_process_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "photo_keys" DROP CONSTRAINT "photo_keys_beol_option_id_fkey";

-- DropForeignKey
ALTER TABLE "stream_info" DROP CONSTRAINT "stream_info_beol_option_id_fkey";

-- AlterTable
ALTER TABLE "beol_options" DROP COLUMN "process_plan_id",
ADD COLUMN     "beol_group_id" INTEGER;

-- AlterTable
ALTER TABLE "gds_path_info" DROP COLUMN "beol_option_id",
ADD COLUMN     "beol_group_id" INTEGER;

-- AlterTable
ALTER TABLE "photo_keys" DROP COLUMN "beol_option_id",
ADD COLUMN     "beol_group_id" INTEGER;

-- AlterTable
ALTER TABLE "request_table_maps" DROP COLUMN "beol_option_id",
ADD COLUMN     "beol_group_id" INTEGER;

-- AlterTable
ALTER TABLE "reticle_layouts" DROP COLUMN "beol_option_id",
ADD COLUMN     "beol_group_id" INTEGER;

-- AlterTable
ALTER TABLE "stream_info" DROP COLUMN "beol_option_id",
ADD COLUMN     "beol_group_id" INTEGER;

-- CreateTable
CREATE TABLE "beol_groups" (
    "id" SERIAL NOT NULL,
    "group_name" VARCHAR,
    "process_plan_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beol_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_beol_groups_id" ON "beol_groups"("id");

-- CreateIndex
CREATE INDEX "ix_beol_groups_group_name" ON "beol_groups"("group_name");

-- AddForeignKey
ALTER TABLE "beol_groups" ADD CONSTRAINT "beol_groups_process_plan_id_fkey" FOREIGN KEY ("process_plan_id") REFERENCES "process_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "beol_options" ADD CONSTRAINT "beol_options_beol_group_id_fkey" FOREIGN KEY ("beol_group_id") REFERENCES "beol_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "photo_keys" ADD CONSTRAINT "photo_keys_beol_group_id_fkey" FOREIGN KEY ("beol_group_id") REFERENCES "beol_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stream_info" ADD CONSTRAINT "stream_info_beol_group_id_fkey" FOREIGN KEY ("beol_group_id") REFERENCES "beol_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "request_table_maps" ADD CONSTRAINT "request_table_maps_beol_group_id_fkey" FOREIGN KEY ("beol_group_id") REFERENCES "beol_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
