import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express'; import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service'; import { SessionGuard } from '../../shared/guards/session.guard'; import { CsrfGuard } from '../../shared/guards/csrf.guard'; import { CurrentUser } from '../../shared/decorators/current-user.decorator';
class LoginDto {@IsEmail() email!:string; @IsString() @MinLength(1) password!:string}
@Controller('auth') export class AuthController {
 constructor(private readonly auth:AuthService) {}
 @Post('login') async login(@Body() body:LoginDto,@Res({passthrough:true}) res:Response) { const result=await this.auth.login(body.email,body.password); const options={sameSite:'lax' as const,secure:process.env.NODE_ENV==='production',path:'/',maxAge:8*36e5}; res.cookie('nexo_session',result.token,{...options,httpOnly:true});res.cookie('nexo_csrf',result.csrfToken,{...options,httpOnly:false});return {user:result.user}; }
 @UseGuards(SessionGuard,CsrfGuard) @Post('logout') async logout(@Res({passthrough:true}) res:Response){await this.auth.logout(res.req.cookies?.nexo_session);res.clearCookie('nexo_session');res.clearCookie('nexo_csrf');return{ok:true}}
 @UseGuards(SessionGuard) @Get('me') me(@CurrentUser() user:unknown){return user}
}
