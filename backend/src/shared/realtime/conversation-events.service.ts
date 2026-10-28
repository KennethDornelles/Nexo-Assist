import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
export type ConversationEvent={id:string;type:'message'|'processing'|'completed'|'failed';conversationId:string;data:object};
@Injectable() export class ConversationEventsService { private readonly subject=new Subject<ConversationEvent>(); emit(event:ConversationEvent){this.subject.next(event)} stream(){return this.subject.asObservable()} }
