-- CreateTable
CREATE TABLE "n7_maskbeol" (
    "id" SERIAL NOT NULL,
    "obid" VARCHAR(24),
    "n7beol" VARCHAR(20),
    "n7process_grp" VARCHAR(20),
    "n7make_date" VARCHAR(20),
    "n7make_id" VARCHAR(20),
    "n7make_name" VARCHAR(60),
    "n7make_teamname" VARCHAR(60),
    "n7modify_date" VARCHAR(20),
    "n7modify_id" VARCHAR(20),
    "n7modify_name" VARCHAR(20),
    "n7modify_teamname" VARCHAR(60),
    "n7use_flag" VARCHAR(1),
    "n7make_id_jmody" VARCHAR(1),
    "n7modify_id_jmody" VARCHAR(1),
    "n7customer_flag" VARCHAR(3),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "n7_maskbeol_pkey" PRIMARY KEY ("id")
);
