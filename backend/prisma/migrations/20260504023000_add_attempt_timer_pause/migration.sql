-- Add timer accounting fields so in-progress attempts can be paused without
-- burning time while the user is away from the exam screen.
ALTER TABLE "attempts"
ADD COLUMN "elapsedSeconds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "timerStartedAt" TIMESTAMP(3);
