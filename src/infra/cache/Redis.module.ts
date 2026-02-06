import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis/RedisService';

@Global() // Disponível em toda aplicação
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
