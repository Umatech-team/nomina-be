import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();

    this.$on('query' as never, (event: Prisma.QueryEvent) => {
      const duration = event.duration;
      const query = event.query;
      const params = event.params;

      if (duration >= 1000) {
        const red = '\x1b[31m';
        const reset = '\x1b[0m';
        console.error(
          `${red}❌ CRITICAL QUERY [${duration}ms]${reset}`,
          `\n  ${query.substring(0, 150)}${query.length > 150 ? '...' : ''}`,
          `\n  Params: ${params}`,
        );
      } else if (duration >= 300) {
        const yellow = '\x1b[33m';
        const reset = '\x1b[0m';
        console.warn(
          `${yellow}⚠️ SLOW QUERY [${duration}ms]${reset}`,
          `\n  ${query.substring(0, 150)}${query.length > 150 ? '...' : ''}`,
          `\n  Params: ${params}`,
        );
      }
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
