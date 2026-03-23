-- CreateTable
CREATE TABLE "gds_path_info" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "process_plan_id" INTEGER NOT NULL,
    "beol_option_id" INTEGER NOT NULL,
    "gds_path_list" VARCHAR[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gds_path_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_gds_path_info_id" ON "gds_path_info"("id");

-- AddForeignKey
ALTER TABLE "gds_path_info" ADD CONSTRAINT "gds_path_info_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "request_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
