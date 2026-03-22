-- CreateTable
CREATE TABLE "user_mail_groups" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "group_name" VARCHAR NOT NULL,
    "members" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_mail_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_default_mailers" (
    "id" SERIAL NOT NULL,
    "category" VARCHAR NOT NULL,
    "recipients" JSONB NOT NULL,

    CONSTRAINT "system_default_mailers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_watchers" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "watchers" JSONB NOT NULL,
    "update_time" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "request_watchers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_default_mailers_category_key" ON "system_default_mailers"("category");

-- CreateIndex
CREATE UNIQUE INDEX "request_watchers_request_id_key" ON "request_watchers"("request_id");

-- AddForeignKey
ALTER TABLE "request_watchers" ADD CONSTRAINT "request_watchers_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "request_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
