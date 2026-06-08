-- CreateEnum
CREATE TYPE "ScheduleEventType" AS ENUM ('BROADCAST', 'STUDIO', 'SERVER', 'VIDEO_EDITING', 'RADIO', 'INGEST', 'ADVERTISING', 'RESERVE', 'OTHER');

-- CreateTable
CREATE TABLE "ScheduleEvent" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "type" "ScheduleEventType" NOT NULL DEFAULT 'OTHER',
    "location" TEXT,
    "equipment" TEXT,
    "channel" TEXT,
    "responsible" TEXT,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ScheduleEvent" ADD CONSTRAINT "ScheduleEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
