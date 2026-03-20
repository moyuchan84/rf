/*
  Warnings:

  - You are about to drop the column `stream_input` on the `stream_info` table. All the data in the column will be lost.
  - You are about to drop the column `stream_output` on the `stream_info` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "stream_info" DROP COLUMN "stream_input",
DROP COLUMN "stream_output",
ADD COLUMN     "stream_input_output_file" TEXT;
