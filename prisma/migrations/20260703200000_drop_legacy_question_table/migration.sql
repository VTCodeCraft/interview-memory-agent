-- Final cleanup: remove legacy row-per-question storage.
DROP TABLE IF EXISTS "Question" CASCADE;
