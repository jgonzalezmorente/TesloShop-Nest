import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  
  constructor(
    @InjectRepository( User )
    private readonly userRepository: Repository<User> ,

    private readonly jwtService: JwtService
  ) {}

  async create( createUserDto: CreateUserDto ) {    
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync( password, 10 )
      });

      await this.userRepository.save( user );
      delete user.password;
      
      return {
        ...user,
        token: this.getJwtToken( user )
      };
        
      
    } catch (error) {
      this.handleDBErrors( error );
    }
  }

  async login( loginUserDto: LoginUserDto ) {
    const { password, email } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, email: true, password: true }
    });

    if ( !user ) {
      throw new UnauthorizedException( 'Credentials are not valid (email)' );
    }

    if ( !bcrypt.compareSync( password, user.password ) ) {
      throw new UnauthorizedException( 'Credentials are not valid (password)' );
    }

    delete user.password;    
    return {
      ...user,
      token: this.getJwtToken( user )
    };
  }

  checkAuthService( user: User ) {
    return {
      ...user,
      token: this.getJwtToken( user )
    }

  }
  
  private getJwtToken( user: User ) {
    const payload: JwtPayload = { id: user.id };
    const token = this.jwtService.sign( payload ); 
    return token;
  }

  private handleDBErrors( error: any ): never {
    if ( error.code === '23505' ) 
      throw new BadRequestException( error.detail );

      console.log( error );
      throw new InternalServerErrorException( 'Please check server logs' );
  }

}
