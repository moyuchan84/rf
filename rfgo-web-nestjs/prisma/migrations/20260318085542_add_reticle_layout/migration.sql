-- CreateTable
CREATE TABLE "reticle_layouts" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "beol_option_id" INTEGER,
    "process_plan_id" INTEGER,
    "shot_info" JSONB,
    "image_url" TEXT,
    "boundary" JSONB,
    "chips" JSONB,
    "scribelanes" JSONB,
    "placements" JSONB,
    "config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reticle_layouts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "reticle_layouts" ADD CONSTRAINT "reticle_layouts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
