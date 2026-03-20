/*
  Warnings:

  - Added the required column `request_type` to the `request_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product_meta" ADD COLUMN     "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "update_time" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "request_items" ADD COLUMN     "request_type" VARCHAR NOT NULL;

-- CreateTable
CREATE TABLE "request_assignees" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "category" VARCHAR NOT NULL,
    "user_id" VARCHAR NOT NULL,
    "user_name" VARCHAR NOT NULL,

    CONSTRAINT "request_assignees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_steps" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "step_order" INTEGER NOT NULL,
    "step_name" VARCHAR NOT NULL,
    "status" VARCHAR NOT NULL,
    "work_content" TEXT,
    "worker_id" VARCHAR,
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "request_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "key_designs" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "key_type" VARCHAR NOT NULL,
    "size_x" DOUBLE PRECISION NOT NULL,
    "size_y" DOUBLE PRECISION NOT NULL,
    "is_vertical" BOOLEAN NOT NULL,
    "is_horizontal" BOOLEAN NOT NULL,
    "rotation" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "gds_path" VARCHAR,
    "edm_list" VARCHAR[],
    "x_axis" JSON NOT NULL,
    "y_axis" JSON NOT NULL,
    "images" VARCHAR[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "key_designs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reticle_layouts" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR NOT NULL,
    "product_id" INTEGER NOT NULL,
    "beol_option_id" INTEGER,
    "process_plan_id" INTEGER,
    "shot_info" JSON,
    "image_url" VARCHAR,
    "boundary" JSON,
    "chips" JSON,
    "scribelanes" JSON,
    "placements" JSON,
    "config" JSON,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reticle_layouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stream_info" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "process_plan_id" INTEGER NOT NULL,
    "beol_option_id" INTEGER NOT NULL,
    "stream_path" VARCHAR NOT NULL,
    "stream_input" VARCHAR[],
    "stream_output" VARCHAR[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stream_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_table_maps" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "product_id" INTEGER,
    "process_plan_id" INTEGER,
    "beol_option_id" INTEGER,
    "photo_key_id" INTEGER NOT NULL,
    "type" VARCHAR NOT NULL,

    CONSTRAINT "request_table_maps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_KeyDesignToProcessPlan" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_KeyDesignToProcessPlan_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "ix_request_assignees_id" ON "request_assignees"("id");

-- CreateIndex
CREATE INDEX "ix_request_steps_id" ON "request_steps"("id");

-- CreateIndex
CREATE INDEX "ix_key_designs_id" ON "key_designs"("id");

-- CreateIndex
CREATE INDEX "ix_reticle_layouts_id" ON "reticle_layouts"("id");

-- CreateIndex
CREATE INDEX "ix_stream_info_id" ON "stream_info"("id");

-- CreateIndex
CREATE INDEX "ix_request_table_maps_id" ON "request_table_maps"("id");

-- CreateIndex
CREATE INDEX "_KeyDesignToProcessPlan_B_index" ON "_KeyDesignToProcessPlan"("B");

-- AddForeignKey
ALTER TABLE "request_assignees" ADD CONSTRAINT "request_assignees_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "request_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_steps" ADD CONSTRAINT "request_steps_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "request_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stream_info" ADD CONSTRAINT "stream_info_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "request_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_table_maps" ADD CONSTRAINT "request_table_maps_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "request_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_table_maps" ADD CONSTRAINT "request_table_maps_photo_key_id_fkey" FOREIGN KEY ("photo_key_id") REFERENCES "photo_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KeyDesignToProcessPlan" ADD CONSTRAINT "_KeyDesignToProcessPlan_A_fkey" FOREIGN KEY ("A") REFERENCES "key_designs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KeyDesignToProcessPlan" ADD CONSTRAINT "_KeyDesignToProcessPlan_B_fkey" FOREIGN KEY ("B") REFERENCES "process_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
