import { createParamDecorator, ExecutionContext } from '@nestjs/common'; export const CurrentUser=createParamDecorator((_d:string,ctx:ExecutionContext)=>ctx.switchToHttp().getRequest().user);
