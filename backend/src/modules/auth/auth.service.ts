import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../shared/database/prisma.service';
const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
@Injectable() export class AuthService {
 constructor(private readonly prisma:PrismaService,private readonly config:ConfigService) {}
 async login(email:string,password:string) {
  if(this.config.get('DEMO_AUTH_ENABLED')!=='true') throw new ForbiddenException('Login demo está desabilitado');
  if(!password) throw new UnauthorizedException('Senha obrigatória');
  const user=await this.prisma.user.findUnique({where:{email}}); if(!user) throw new UnauthorizedException('Credenciais inválidas');
  const token=randomBytes(32).toString('base64url'); const csrfToken=randomBytes(32).toString('base64url');
  await this.prisma.session.create({data:{userId:user.id,tokenHash:hash(token),csrfTokenHash:hash(csrfToken),expiresAt:new Date(Date.now()+8*36e5)}});
  return {token,csrfToken,user:{id:user.id,name:user.name,email:user.email,role:user.role}};
 }
 async logout(token?:string){if(token)await this.prisma.session.deleteMany({where:{tokenHash:hash(token)}})}
}
