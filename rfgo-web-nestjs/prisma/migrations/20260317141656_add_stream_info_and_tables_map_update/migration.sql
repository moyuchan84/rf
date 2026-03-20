-- AlterTable
ALTER TABLE "request_tables_map" ADD COLUMN     "beol_option_id" INTEGER,
ADD COLUMN     "process_plan_id" INTEGER,
ADD COLUMN     "product_id" INTEGER;

-- CreateTable
CREATE TABLE "stream_info" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "process_plan_id" INTEGER NOT NULL,
    "beol_option_id" INTEGER NOT NULL,
    "stream_path" TEXT NOT NULL,
    "stream_input" TEXT[],
    "stream_output" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stream_info_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "stream_info" ADD CONSTRAINT "stream_info_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "request_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
