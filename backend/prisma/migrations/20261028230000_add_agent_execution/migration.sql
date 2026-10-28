-- CreateEnum
CREATE TYPE "AgentExecutionState" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "processingExecutionId" TEXT;

-- CreateTable
CREATE TABLE "AgentExecution" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "inputMessageId" TEXT NOT NULL,
    "state" "AgentExecutionState" NOT NULL DEFAULT 'PROCESSING',
    "responseMessageId" TEXT,
    "decisionId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "errorCode" TEXT,

    CONSTRAINT "AgentExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentExecution_inputMessageId_key" ON "AgentExecution"("inputMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentExecution_responseMessageId_key" ON "AgentExecution"("responseMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentExecution_decisionId_key" ON "AgentExecution"("decisionId");

-- CreateIndex
CREATE INDEX "AgentExecution_conversationId_state_idx" ON "AgentExecution"("conversationId", "state");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_processingExecutionId_key" ON "Conversation"("processingExecutionId");

-- AddForeignKey
ALTER TABLE "AgentExecution" ADD CONSTRAINT "AgentExecution_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentExecution" ADD CONSTRAINT "AgentExecution_inputMessageId_fkey" FOREIGN KEY ("inputMessageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentExecution" ADD CONSTRAINT "AgentExecution_responseMessageId_fkey" FOREIGN KEY ("responseMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
