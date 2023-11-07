import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor( private readonly seedService: SeedService ) {}

  @Get()
  // @Auth( ValidRoles.admin )
  executeSeed() {
    return this.seedService.runSeed();
  }
}
