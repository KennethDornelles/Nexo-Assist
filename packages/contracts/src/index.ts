import { z } from 'zod';
export const roleSchema=z.enum(['EMPLOYEE','ANALYST']);
export const conversationStateSchema=z.enum(['AGENT_ACTIVE','WAITING_ANALYST','ANALYST_ACTIVE','CLOSED']);
export const ticketStatusSchema=z.enum(['OPEN','IN_PROGRESS','RESOLVED','CLOSED']);
export const messageInputSchema=z.object({content:z.string().trim().min(1).max(4000)});
export const articleSearchSchema=z.object({query:z.string().trim().min(1).max(120),page:z.coerce.number().int().min(1).default(1)});
export const ticketDraftProposalSchema=z.object({operation:z.enum(['CREATE','UPDATE','REOPEN']),ticketId:z.string().cuid().optional(),payload:z.record(z.string(),z.unknown())});
export type SseMessageEvent={id:string;type:'message';conversationId:string;data:{id:string;authorType:string;content:string;createdAt:string}};
