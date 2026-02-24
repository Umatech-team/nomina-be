import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE_TOKEN } from './drizzle.provider';
import * as schema from './schema';

@Injectable()
export class DrizzleService {
  constructor(
    @Inject(DRIZZLE_TOKEN)
    public readonly db: PostgresJsDatabase<typeof schema>,
  ) {}
}
