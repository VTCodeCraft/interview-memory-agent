-- Store the generated interview payload on the Interview row.
ALTER TABLE "Interview"
ADD COLUMN "questions" JSONB;

-- Speed up latest reusable interview lookups.
CREATE INDEX "Interview_userId_status_updatedAt_idx"
ON "Interview"("userId", "status", "updatedAt");
