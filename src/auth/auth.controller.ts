import { Controller, Get, Post, Body, UseGuards, Headers } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { GetUser, RawHeaders } from './decorators';
import { User } from './entities/user.entity';
import { IncomingHttpHeaders } from 'http';


@Controller( 'auth' )
export class AuthController {

  constructor( private readonly authService: AuthService ) {}

  @Post( 'register' )
  create( @Body() createUserDto: CreateUserDto )  {
    return this.authService.create( createUserDto );
  }

  @Post( 'login' )
  loginUser( @Body() loginUserDto: LoginUserDto )  {
    return this.authService.login( loginUserDto );
  }

  @Get( 'private' )
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    // @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser( 'email' ) userEmail: string,  
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ) {
    console.log( { rawHeaders } );  
    console.log( { headers } );  
    return {
      ok: true,
      message: 'Hola Mundo Private',
      user,
      userEmail,
      rawHeaders,
      headers
    }
  }
}
