-- CreateTable
CREATE TABLE "request_comments" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "author_id" VARCHAR NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_request_comments_id" ON "request_comments"("id");

-- AddForeignKey
ALTER TABLE "request_comments" ADD CONSTRAINT "request_comments_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "request_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_comments" ADD CONSTRAINT "request_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
