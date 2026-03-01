import { env } from '@infra/env';
import { Injectable, Logger, OnModuleDestroy, Provider } from '@nestjs/common';
import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const DRIZZLE_TOKEN = Symbol('DRIZZLE_CONNECTION');

const SLOW_QUERY_WARN_MS = 300;
const SLOW_QUERY_ERROR_MS = 1000;

@Injectable()
export class DrizzleProvider implements OnModuleDestroy {
  private readonly logger = new Logger(DrizzleProvider.name);
  private readonly queryClient: postgres.Sql;
  readonly db: PostgresJsDatabase<typeof schema>;

  constructor() {
    const connectionString = env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is missing for Drizzle initialization');
    }

    this.queryClient = postgres(connectionString, {
      max: 10,
      idle_timeout: 60,
      connect_timeout: 10,
      ssl: env.NODE_ENV === 'production' ? 'require' : false,
    });

    this.patchUnsafeForSlowQueryLogging();

    this.db = drizzle(this.queryClient, { schema, logger: false });
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Closing PostgreSQL connection pool…');
    await this.queryClient.end({ timeout: 5 });
    this.logger.log('PostgreSQL connection pool closed.');
  }

  // ---------------------------------------------------------------------------
  // Slow-query instrumentation
  // postgres-js does not expose per-query timing, so we wrap sql.unsafe()
  // which is the single code-path drizzle-orm uses for every ORM query.
  // ---------------------------------------------------------------------------
  private patchUnsafeForSlowQueryLogging(): void {
    const originalUnsafe = this.queryClient.unsafe.bind(this.queryClient);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const provider = this;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.queryClient as any).unsafe = function (
      query: string,
      params?: unknown[],
    ) {
      const start = performance.now();
      const pending = originalUnsafe(
        query,
        (params ?? []) as Parameters<typeof originalUnsafe>[1],
      );

      return new Promise((resolve, reject) => {
        Promise.resolve(pending).then(
          (rows) => {
            provider.reportSlowQuery(
              query,
              Math.round(performance.now() - start),
            );
            resolve(rows);
          },
          (err: unknown) => {
            provider.reportSlowQuery(
              query,
              Math.round(performance.now() - start),
            );
            reject(err);
          },
        );
      });
    };
  }

  private reportSlowQuery(query: string, ms: number): void {
    if (ms < SLOW_QUERY_WARN_MS) return;

    const preview = query.length > 200 ? `${query.slice(0, 200)}…` : query;

    if (ms >= SLOW_QUERY_ERROR_MS) {
      this.logger.error(`Slow query (${ms}ms): ${preview}`);
    } else {
      this.logger.warn(`Slow query (${ms}ms): ${preview}`);
    }
  }
}

export const DrizzleTokenProvider: Provider = {
  provide: DRIZZLE_TOKEN,
  useFactory: (provider: DrizzleProvider) => provider.db,
  inject: [DrizzleProvider],
};
