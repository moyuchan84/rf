-- CreateTable
CREATE TABLE "key_designs" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "key_type" TEXT NOT NULL,
    "size_x" DOUBLE PRECISION NOT NULL,
    "size_y" DOUBLE PRECISION NOT NULL,
    "is_vertical" BOOLEAN NOT NULL DEFAULT true,
    "is_horizontal" BOOLEAN NOT NULL DEFAULT true,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "gds_path" TEXT,
    "edm_list" TEXT[],
    "x_axis" JSONB NOT NULL,
    "y_axis" JSONB NOT NULL,
    "images" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "key_designs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_KeyDesignToProcessPlan" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_KeyDesignToProcessPlan_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "key_designs_name_key" ON "key_designs"("name");

-- CreateIndex
CREATE INDEX "_KeyDesignToProcessPlan_B_index" ON "_KeyDesignToProcessPlan"("B");

-- AddForeignKey
ALTER TABLE "_KeyDesignToProcessPlan" ADD CONSTRAINT "_KeyDesignToProcessPlan_A_fkey" FOREIGN KEY ("A") REFERENCES "key_designs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KeyDesignToProcessPlan" ADD CONSTRAINT "_KeyDesignToProcessPlan_B_fkey" FOREIGN KEY ("B") REFERENCES "process_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
