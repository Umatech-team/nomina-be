-- CreateTable
CREATE TABLE "workspace_invites" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(8) NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_by" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "used_by" TEXT,

    CONSTRAINT "workspace_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workspace_invites_code_key" ON "workspace_invites"("code");

-- CreateIndex
CREATE INDEX "workspace_invites_code_idx" ON "workspace_invites"("code");

-- CreateIndex
CREATE INDEX "workspace_invites_workspace_id_expires_at_idx" ON "workspace_invites"("workspace_id", "expires_at");

-- AddForeignKey
ALTER TABLE "workspace_invites" ADD CONSTRAINT "workspace_invites_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_invites" ADD CONSTRAINT "workspace_invites_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
