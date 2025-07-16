-- Tambahkan kolom baru tapi izinkan NULL dulu
ALTER TABLE "ProjectInvite" 
ADD COLUMN "invitedUserId" INTEGER,
ADD COLUMN "projectId" INTEGER;

-- Salin data lama dari kolom lama ke kolom baru
UPDATE "ProjectInvite" 
SET 
  "invitedUserId" = "invited_user_id",
  "projectId" = "project_id";

-- Hapus kolom lama
ALTER TABLE "ProjectInvite" 
DROP COLUMN "invited_user_id",
DROP COLUMN "project_id";

-- Tambahkan kolom createdAt
ALTER TABLE "ProjectInvite"
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Tambahkan foreign key baru
ALTER TABLE "ProjectInvite" 
ADD CONSTRAINT "ProjectInvite_projectId_fkey" 
FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ProjectInvite" 
ADD CONSTRAINT "ProjectInvite_invitedUserId_fkey" 
FOREIGN KEY ("invitedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Terakhir, jadikan kolom baru NOT NULL setelah yakin sudah terisi
ALTER TABLE "ProjectInvite"
ALTER COLUMN "projectId" SET NOT NULL,
ALTER COLUMN "invitedUserId" SET NOT NULL;
