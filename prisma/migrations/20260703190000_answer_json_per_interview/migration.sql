-- Reshape Answer into one row per interview with JSONB payload.
ALTER TABLE "Answer" RENAME TO "AnswerLegacy";
ALTER TABLE "AnswerLegacy" RENAME CONSTRAINT "Answer_pkey" TO "AnswerLegacy_pkey";

CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answers" JSONB NOT NULL DEFAULT '{"answers":[]}'::jsonb,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Answer_interviewId_key" ON "Answer"("interviewId");
CREATE INDEX "Answer_userId_idx" ON "Answer"("userId");

ALTER TABLE "Answer"
ADD CONSTRAINT "Answer_interviewId_fkey"
FOREIGN KEY ("interviewId") REFERENCES "Interview"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Answer"
ADD CONSTRAINT "Answer_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "Answer" ("id", "interviewId", "userId", "answers", "createdAt", "updatedAt")
SELECT
    md5(random()::text || clock_timestamp()::text),
    q."interviewId",
    i."userId",
    jsonb_build_object(
        'answers',
        jsonb_agg(
            jsonb_build_object(
                'sequence', q."sequence",
                'transcript', a."transcript",
                'duration', a."duration",
                'confidence', a."confidence"
            )
            ORDER BY q."sequence"
        )
    ),
    MIN(a."createdAt"),
    MAX(a."createdAt")
FROM "AnswerLegacy" a
JOIN "Question" q ON q."id" = a."questionId"
JOIN "Interview" i ON i."id" = q."interviewId"
GROUP BY q."interviewId", i."userId";

DROP TABLE "AnswerLegacy";
