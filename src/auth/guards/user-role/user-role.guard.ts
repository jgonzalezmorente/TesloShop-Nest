import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {

  //! Reflector -> clase de ayuda que se utiliza para recuperar metadatos sobre decoradores, clases, métodos, etc.
  constructor( private readonly reflector: Reflector ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    
    //! context.getHandler() -> obtiene una referencia al método del controlador sobre el que se aplica el guard
    const validRoles: string[] = this.reflector.get( META_ROLES, context.getHandler() );

    if ( !validRoles ) return true;
    if ( validRoles.length === 0 ) return true;
    
    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if ( !user ) {
      throw new BadRequestException( 'User not found' );
    }

    for( const role of user.roles ) {
      if ( validRoles.includes( role ) ) {
        return true;
      }
    }
    
    throw new ForbiddenException(
      `User ${ user.fullName } need a valid role: [${ validRoles }]`
    );
  }
}
