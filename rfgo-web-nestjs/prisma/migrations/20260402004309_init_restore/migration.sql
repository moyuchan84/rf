/*
  Warnings:

  - You are about to drop the column `mto_date` on the `product_meta` table. All the data in the column will be lost.
  - You are about to drop the `_KeyDesignToProcessPlan` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- DropForeignKey
ALTER TABLE "_KeyDesignToProcessPlan" DROP CONSTRAINT "_KeyDesignToProcessPlan_A_fkey";

-- DropForeignKey
ALTER TABLE "_KeyDesignToProcessPlan" DROP CONSTRAINT "_KeyDesignToProcessPlan_B_fkey";

-- AlterTable
ALTER TABLE "product_meta" DROP COLUMN "mto_date";

-- AlterTable
ALTER TABLE "request_items" ADD COLUMN     "layout_request_description" TEXT,
ADD COLUMN     "mto_date" TIMESTAMPTZ(6);

-- DropTable
DROP TABLE "_KeyDesignToProcessPlan";

-- CreateTable
CREATE TABLE "photo_key_embeddings" (
    "id" SERIAL NOT NULL,
    "photo_key_id" INTEGER NOT NULL,
    "embedding" vector(1024),
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_key_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "key_design_process_plan_maps" (
    "id" SERIAL NOT NULL,
    "key_design_id" INTEGER NOT NULL,
    "process_plan_id" INTEGER NOT NULL,

    CONSTRAINT "key_design_process_plan_maps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "photo_key_embeddings_photo_key_id_key" ON "photo_key_embeddings"("photo_key_id");

-- CreateIndex
CREATE INDEX "ix_key_design_process_plan_maps_id" ON "key_design_process_plan_maps"("id");

-- AddForeignKey
ALTER TABLE "photo_key_embeddings" ADD CONSTRAINT "photo_key_embeddings_photo_key_id_fkey" FOREIGN KEY ("photo_key_id") REFERENCES "photo_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "key_design_process_plan_maps" ADD CONSTRAINT "key_design_process_plan_maps_key_design_id_fkey" FOREIGN KEY ("key_design_id") REFERENCES "key_designs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "key_design_process_plan_maps" ADD CONSTRAINT "key_design_process_plan_maps_process_plan_id_fkey" FOREIGN KEY ("process_plan_id") REFERENCES "process_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stream_info" ADD CONSTRAINT "stream_info_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stream_info" ADD CONSTRAINT "stream_info_process_plan_id_fkey" FOREIGN KEY ("process_plan_id") REFERENCES "process_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stream_info" ADD CONSTRAINT "stream_info_beol_option_id_fkey" FOREIGN KEY ("beol_option_id") REFERENCES "beol_options"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
