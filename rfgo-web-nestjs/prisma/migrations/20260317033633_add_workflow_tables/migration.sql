-- CreateTable
CREATE TABLE "photo_keys" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "rfg_category" TEXT,
    "photo_category" TEXT,
    "is_reference" BOOLEAN NOT NULL DEFAULT false,
    "table_name" TEXT NOT NULL,
    "rev_no" INTEGER NOT NULL,
    "workbook_data" JSONB,
    "filename" TEXT,
    "updater" TEXT,
    "update_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_assignees" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,

    CONSTRAINT "request_assignees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_steps" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "step_order" INTEGER NOT NULL,
    "step_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "work_content" TEXT,
    "worker_id" TEXT,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "request_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_tables_map" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "photo_key_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "request_tables_map_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "photo_keys" ADD CONSTRAINT "photo_keys_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_assignees" ADD CONSTRAINT "request_assignees_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "request_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_steps" ADD CONSTRAINT "request_steps_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "request_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_tables_map" ADD CONSTRAINT "request_tables_map_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "request_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_tables_map" ADD CONSTRAINT "request_tables_map_photo_key_id_fkey" FOREIGN KEY ("photo_key_id") REFERENCES "photo_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
