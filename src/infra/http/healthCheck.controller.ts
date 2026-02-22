import { RedisService } from '@infra/cache/redis/RedisService';
import { PrismaService } from '@infra/databases/prisma/prisma.service';
import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      const isRedisEnabled = process.env.REDIS_ENABLED === 'true';
      if (isRedisEnabled) {
        const isRedisAwake = await this.redisService.ping();
        if (!isRedisAwake) {
          throw new Error('Redis ping failed');
        }
      }

      return { status: 'ok', timestamp: new Date().toISOString() };
    } catch (error) {
      throw new ServiceUnavailableException({
        status: 'error',
        message: 'Infrastructure dependencies are unavailable',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
