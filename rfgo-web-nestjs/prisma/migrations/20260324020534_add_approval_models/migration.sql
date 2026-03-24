-- CreateTable
CREATE TABLE "user_approval_paths" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "path_name" VARCHAR NOT NULL,
    "pathItems" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_approval_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_documents" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "ap_inf_id" VARCHAR NOT NULL,
    "doc_no" VARCHAR,
    "status" VARCHAR NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "approval_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_approval_paths_user_id_idx" ON "user_approval_paths"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "approval_documents_request_id_key" ON "approval_documents"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "approval_documents_ap_inf_id_key" ON "approval_documents"("ap_inf_id");

-- AddForeignKey
ALTER TABLE "approval_documents" ADD CONSTRAINT "approval_documents_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "request_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
