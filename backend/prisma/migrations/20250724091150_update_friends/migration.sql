/*
  Warnings:

  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_post_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_sender_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_user_id_fkey";

-- DropTable
DROP TABLE "Notification";

-- CreateTable
CREATE TABLE "Block" (
    "blocker_id" UUID NOT NULL,
    "blocked_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("blocker_id","blocked_id")
);

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
