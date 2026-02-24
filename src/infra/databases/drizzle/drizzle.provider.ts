import { env } from '@infra/env';
import { Provider } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const DRIZZLE_TOKEN = Symbol('DRIZZLE_CONNECTION');

export const DrizzleProvider: Provider = {
  provide: DRIZZLE_TOKEN,
  useFactory: () => {
    const connectionString = env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is missing for Drizzle initialization');
    }

    const queryClient = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
    });

    return drizzle(queryClient, { schema, logger: false });
  },
};
