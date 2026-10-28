import { ConversationsController } from '../src/modules/conversations/conversations.controller';
describe('message execution correlation',()=>{
 it('publishes only the IDs returned by the agent execution',async()=>{
  const emitted:any[]=[];const employee={id:'employee-message',eventId:'employee-event',content:'Oi'};
  const service:any={add:jest.fn().mockResolvedValue(employee),recordAgentFailure:jest.fn()};
  const agent:any={respond:jest.fn().mockResolvedValue({message:{id:'agent-message',eventId:'agent-event',authorType:'AGENT',content:'Resposta',createdAt:new Date('2026-01-01')},decision:{id:'decision-1'}})};
  const events:any={emit:(event:any)=>emitted.push(event)};
  const controller=new ConversationsController(service,agent,events);
  const result:any=await controller.send('conversation-1',{content:'Oi'},{id:'employee-1',role:'EMPLOYEE'});
  expect(result).toMatchObject({status:'completed',agentMessageId:'agent-message',decisionId:'decision-1'});
  expect(emitted.find(event=>event.type==='message')).toMatchObject({id:'agent-event',data:{messageId:'agent-message',decisionId:'decision-1'}});
  expect(service).not.toHaveProperty('access');
 });
 it('does not turn a persisted generation into a failure when publication throws',async()=>{
  const service:any={add:jest.fn().mockResolvedValue({id:'employee-message',eventId:'employee-event',content:'Oi'}),recordAgentFailure:jest.fn()};
  const agent:any={respond:jest.fn().mockResolvedValue({message:{id:'agent-message',eventId:'agent-event',authorType:'AGENT',content:'Resposta',createdAt:new Date()},decision:{id:'decision-1'}})};
  let calls=0;const events:any={emit:()=>{calls++;if(calls>1)throw new Error('subscriber disconnected')}};
  const controller=new ConversationsController(service,agent,events);
  const result:any=await controller.send('conversation-1',{content:'Oi'},{id:'employee-1',role:'EMPLOYEE'});
  expect(result.status).toBe('completed');expect(service.recordAgentFailure).not.toHaveBeenCalled();
 });
});
