import { Controller, Get, Post, Body, UseGuards, Headers, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { IncomingHttpHeaders } from 'http';
import { Auth, GetUser, RawHeaders } from './decorators';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';


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
    return {
      ok: true,
      message: 'Hola Mundo Private',
      user,
      userEmail,
      rawHeaders,
      headers
    }
  }
  
  // @SetMetadata( 'roles', [ 'admin', 'super-user' ])

  @Get( 'private2' )
  @RoleProtected( ValidRoles.admin, ValidRoles.user )
  @UseGuards( AuthGuard(), UserRoleGuard )
  privateRoute2(
    @GetUser() user: User
  ) {
    return {
      ok: true,
      user
    }
  }

  @Get( 'private3' )
  @Auth( ValidRoles.admin )
  privateRoute3(
    @GetUser() user: User
  ) {
    return {
      ok: true,
      user
    }
  }

}
