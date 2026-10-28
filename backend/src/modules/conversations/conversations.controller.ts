import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { z } from 'zod'; import { CurrentUser } from '../../shared/decorators/current-user.decorator'; import { CsrfGuard } from '../../shared/guards/csrf.guard'; import { SessionGuard } from '../../shared/guards/session.guard'; import { AgentService } from '../agent/agent.service'; import { ConversationsService } from './conversations.service';
const input=z.object({content:z.string().trim().min(1).max(4000)});
@UseGuards(SessionGuard) @Controller('conversations') export class ConversationsController {
 constructor(private readonly conversations:ConversationsService,private readonly agent:AgentService){}
 @UseGuards(CsrfGuard) @Post() create(@CurrentUser() user:{id:string}){return this.conversations.create(user.id)}
 @Get(':id') get(@Param('id') id:string,@CurrentUser() user:{id:string;role:string}){return this.conversations.access(id,user)}
 @UseGuards(CsrfGuard) @Post(':id/messages') async send(@Param('id') id:string,@Body() body:{content:string},@CurrentUser() user:{id:string}) {const message=await this.conversations.add(id,user,input.parse(body).content);try{await this.agent.respond(id,user.id,message.content);return{message,status:'completed'}}catch(error){await this.conversations.recordAgentFailure(id,error);return{message,status:'failed',error:'Não foi possível concluir a resposta do assistente.'}}}
}
