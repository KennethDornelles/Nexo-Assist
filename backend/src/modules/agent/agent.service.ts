import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/database/prisma.service';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { TicketsService } from '../tickets/tickets.service';

export type AgentExecutionResult={message:{id:string;eventId:string;authorType:'AGENT';content:string;createdAt:Date};decision:{id:string}};
@Injectable() export class AgentService {
 private readonly logger=new Logger(AgentService.name);
 constructor(private readonly prisma:PrismaService,private readonly knowledge:KnowledgeService,private readonly tickets:TicketsService,private readonly config:ConfigService){}
 async respond(conversationId:string,userId:string,input:string):Promise<AgentExecutionResult>{
  const started=Date.now();const conversation=await this.prisma.conversation.findFirst({where:{id:conversationId,employeeId:userId,state:'AGENT_ACTIVE'}});
  if(!conversation)throw new ConflictException('Agente indisponível para o estado atual da conversa');
  const articles=await this.knowledge.search(input);const tickets=await this.tickets.listForUser(userId);let text:string;let usage:object|undefined;
  if(this.config.get('LLM_MODE')==='real'){try{const {Agent}=await import('@mastra/core/agent');const agent=new Agent({id:'nexo-readonly',name:'Nexo Assist',model:`openai/${this.config.get('LLM_MODEL')}`,instructions:'Responda em português usando apenas os dados fornecidos.'});const response=await (agent as any).generate(`Pergunta: ${input}`);text=String(response.text??'Não foi possível gerar uma resposta.');usage=response.usage}catch(error){this.logger.error('Falha Mastra/OpenAI',error instanceof Error?error.stack:undefined);throw error}}else{text=articles.length?`Encontrei a orientação “${articles[0].title}”. ${articles[0].content.slice(0,700)}`:`Não encontrei um artigo específico. Você possui ${tickets.length} chamado(s) no histórico.`}
  const current=await this.prisma.conversation.findUnique({where:{id:conversationId},select:{state:true}});if(current?.state!=='AGENT_ACTIVE')throw new ConflictException('A conversa mudou de estado durante a geração');
  const message=await this.prisma.message.create({data:{conversationId,authorType:'AGENT',content:text}});
  const decision=await this.prisma.agentDecision.create({data:{conversationId,messageId:message.id,intent:articles.length?'CONSULTAR_CENTRAL_AJUDA':'CONSULTAR_CHAMADOS',actions:[{name:'mockRead',executed:this.config.get('LLM_MODE')==='mock'}],evidence:{articles:articles.map(a=>({id:a.id,title:a.title})),tickets:tickets.map(t=>({id:t.id,title:t.title,status:t.status}))},decision:'Resposta informativa de leitura',rationale:'Resposta baseada em dados autorizados.',confidenceHeuristic:null,durationMs:Date.now()-started,tokenUsage:usage as any}});
  return{message:{id:message.id,eventId:message.eventId,authorType:'AGENT',content:message.content,createdAt:message.createdAt},decision:{id:decision.id}};
 }
}
