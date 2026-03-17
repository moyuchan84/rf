-- AlterTable
ALTER TABLE "photo_keys" ADD COLUMN     "beol_option_id" INTEGER,
ADD COLUMN     "process_plan_id" INTEGER;

-- AddForeignKey
ALTER TABLE "photo_keys" ADD CONSTRAINT "photo_keys_process_plan_id_fkey" FOREIGN KEY ("process_plan_id") REFERENCES "process_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_keys" ADD CONSTRAINT "photo_keys_beol_option_id_fkey" FOREIGN KEY ("beol_option_id") REFERENCES "beol_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
