import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../database/prisma.service';
@Injectable() export class CsrfGuard implements CanActivate {
 constructor(private readonly prisma: PrismaService) {}
 async canActivate(context: ExecutionContext) {
  const req=context.switchToHttp().getRequest(); const origin=req.header('origin');
  if(origin && !(process.env.WEB_ORIGIN??'').split(',').includes(origin)) throw new ForbiddenException('Origem não permitida');
  const token=req.header('x-csrf-token'); if(!token||token!==req.cookies?.nexo_csrf||!req.user?.id) throw new ForbiddenException('Token CSRF inválido');
  const session=await this.prisma.session.findFirst({where:{userId:req.user.id,csrfTokenHash:createHash('sha256').update(token).digest('hex'),expiresAt:{gt:new Date()}}});
  if(!session) throw new ForbiddenException('Token CSRF inválido'); return true;
 }
}
