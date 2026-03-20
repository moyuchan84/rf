-- CreateTable
CREATE TABLE "process_plans" (
    "id" SERIAL NOT NULL,
    "design_rule" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "process_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beol_options" (
    "id" SERIAL NOT NULL,
    "option_name" TEXT NOT NULL,
    "process_plan_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beol_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "partid" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "beol_option_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_meta" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "process_id" TEXT,
    "mto_date" TIMESTAMP(3),
    "customer" TEXT,
    "application" TEXT,
    "chip_size_x" DOUBLE PRECISION,
    "chip_size_y" DOUBLE PRECISION,
    "sl_size_x" DOUBLE PRECISION,
    "sl_size_y" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_items" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "request_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "edm_list" TEXT[],
    "pkd_versions" TEXT[],
    "requester_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "request_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "process_plans_design_rule_key" ON "process_plans"("design_rule");

-- CreateIndex
CREATE UNIQUE INDEX "beol_options_process_plan_id_option_name_key" ON "beol_options"("process_plan_id", "option_name");

-- CreateIndex
CREATE UNIQUE INDEX "products_partid_key" ON "products"("partid");

-- CreateIndex
CREATE UNIQUE INDEX "product_meta_product_id_key" ON "product_meta"("product_id");

-- AddForeignKey
ALTER TABLE "beol_options" ADD CONSTRAINT "beol_options_process_plan_id_fkey" FOREIGN KEY ("process_plan_id") REFERENCES "process_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_beol_option_id_fkey" FOREIGN KEY ("beol_option_id") REFERENCES "beol_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_meta" ADD CONSTRAINT "product_meta_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_items" ADD CONSTRAINT "request_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
