import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
@Injectable() export class ExecutionRecoveryService implements OnModuleInit {
 constructor(private readonly prisma:PrismaService) {}
 async onModuleInit(){await this.recoverInterrupted()}
 async recoverInterrupted(){const pending=await this.prisma.agentExecution.findMany({where:{state:'PROCESSING'},select:{id:true,conversationId:true}});for(const execution of pending){await this.prisma.$transaction(async tx=>{const changed=await tx.agentExecution.updateMany({where:{id:execution.id,conversationId:execution.conversationId,state:'PROCESSING'},data:{state:'FAILED',errorCode:'PROCESS_INTERRUPTED',finishedAt:new Date()}});if(changed.count)await tx.conversation.updateMany({where:{id:execution.conversationId,processingExecutionId:execution.id},data:{processingExecutionId:null}})})}return pending.length}
}
