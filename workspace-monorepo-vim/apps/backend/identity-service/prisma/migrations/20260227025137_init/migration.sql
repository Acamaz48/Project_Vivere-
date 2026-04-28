-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "legal_name" TEXT NOT NULL,
    "trade_name" TEXT,
    "tax_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "persons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "full_name" TEXT NOT NULL,
    "tax_id" TEXT,
    "birth_date" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_persons" (
    "organization_id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "organization_persons_pkey" PRIMARY KEY ("organization_id","person_id","role")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID,
    "person_id" UUID,
    "street" TEXT NOT NULL,
    "number" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT,
    "zip_code" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Brasil',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "person_id" UUID NOT NULL,
    "purpose" TEXT NOT NULL,
    "is_granted" BOOLEAN NOT NULL DEFAULT false,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "valid_until" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "consents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_tax_id_key" ON "organizations"("tax_id");

-- CreateIndex
CREATE INDEX "organizations_deleted_at_idx" ON "organizations"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "persons_tax_id_key" ON "persons"("tax_id");

-- CreateIndex
CREATE INDEX "persons_deleted_at_idx" ON "persons"("deleted_at");

-- CreateIndex
CREATE INDEX "addresses_organization_id_idx" ON "addresses"("organization_id");

-- CreateIndex
CREATE INDEX "addresses_person_id_idx" ON "addresses"("person_id");

-- CreateIndex
CREATE INDEX "addresses_deleted_at_idx" ON "addresses"("deleted_at");

-- CreateIndex
CREATE INDEX "consents_person_id_idx" ON "consents"("person_id");

-- AddForeignKey
ALTER TABLE "organization_persons" ADD CONSTRAINT "organization_persons_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_persons" ADD CONSTRAINT "organization_persons_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consents" ADD CONSTRAINT "consents_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
