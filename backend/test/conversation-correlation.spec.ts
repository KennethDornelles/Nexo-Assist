import { ConversationsController } from '../src/modules/conversations/conversations.controller';
describe('message execution correlation',()=>{
 it('publishes only the IDs returned by the agent execution',async()=>{
  const emitted:any[]=[];const employee={id:'employee-message',eventId:'employee-event',content:'Oi',authorType:'EMPLOYEE',createdAt:new Date('2026-01-01')};const execution={id:'execution-1'};
  const service:any={acquire:jest.fn().mockResolvedValue({message:employee,execution}),complete:jest.fn(),fail:jest.fn()};
  const agent:any={respond:jest.fn().mockResolvedValue({message:{id:'agent-message',eventId:'agent-event',authorType:'AGENT',content:'Resposta',createdAt:new Date('2026-01-01')},decision:{id:'decision-1'}})};
  const events:any={emit:(event:any)=>emitted.push(event)};
  const controller=new ConversationsController(service,agent,events);
  const result:any=await controller.send('conversation-1',{content:'Oi'},{id:'employee-1',role:'EMPLOYEE'});
  expect(result).toMatchObject({status:'completed',executionId:'execution-1'});expect(service.acquire).toHaveBeenCalledWith('conversation-1',{id:'employee-1',role:'EMPLOYEE'},'Oi');expect(service.complete).toHaveBeenCalledWith('conversation-1','execution-1',expect.objectContaining({message:expect.objectContaining({id:'agent-message'}),decision:{id:'decision-1'}}));
  expect(emitted.find(event=>event.id==='agent-event')).toMatchObject({id:'agent-event',data:{messageId:'agent-message',decisionId:'decision-1'}});
  expect(service.fail).not.toHaveBeenCalled();
 });
 it('does not turn a persisted generation into a failure when publication throws',async()=>{
  const service:any={acquire:jest.fn().mockResolvedValue({message:{id:'employee-message',eventId:'employee-event',content:'Oi',authorType:'EMPLOYEE',createdAt:new Date()},execution:{id:'execution-1'}}),complete:jest.fn(),fail:jest.fn()};
  const agent:any={respond:jest.fn().mockResolvedValue({message:{id:'agent-message',eventId:'agent-event',authorType:'AGENT',content:'Resposta',createdAt:new Date()},decision:{id:'decision-1'}})};
  let calls=0;const events:any={emit:()=>{calls++;if(calls>2)throw new Error('subscriber disconnected')}};
  const controller=new ConversationsController(service,agent,events);
  const result:any=await controller.send('conversation-1',{content:'Oi'},{id:'employee-1',role:'EMPLOYEE'});
  expect(result.status).toBe('completed');expect(service.complete).toHaveBeenCalled();expect(service.fail).not.toHaveBeenCalled();
 });
});
