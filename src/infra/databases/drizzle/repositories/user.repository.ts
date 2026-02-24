import { AccountType, UserRole } from '@constants/enums';
import { DrizzleService } from '@infra/databases/drizzle/drizzle.service';
import { PlanType } from '@modules/subscription';
import { User } from '@modules/user/entities/User';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { and, eq } from 'drizzle-orm';
import { UserMapper } from '../mappers/user.mapper';
import * as schema from '../schema';

@Injectable()
export class UserRepositoryImplementation implements UserRepository {
  constructor(private readonly drizzle: DrizzleService) {}
  async create(user: User): Promise<void> {
    await this.drizzle.db.transaction(async (tx) => {
      await tx.insert(schema.users).values(UserMapper.toDatabase(user));

      const workspaceId = randomUUID();
      await tx.insert(schema.workspaces).values({
        id: workspaceId,
        name: 'Espaço Pessoal',
      });

      await tx.insert(schema.subscriptions).values({
        id: randomUUID(),
        userId: user.id,
        planId: PlanType.TRIAL,
        status: 'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await tx.insert(schema.workspaceUsers).values({
        id: randomUUID(),
        userId: user.id,
        workspaceId,
        role: UserRole.OWNER,
        isDefault: true,
        joinedAt: new Date(),
      });

      await tx.insert(schema.accounts).values({
        id: randomUUID(),
        workspaceId,
        name: 'Carteira',
        type: AccountType.CASH,
        balance: 0,
      });
    });
  }

  update(user: User): Promise<void> {
    throw new Error('Method not implemented.');
  }

  delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  findUniqueById(id: string): Promise<User | null> {
    throw new Error('Method not implemented.');
  }

  async findUniqueByEmail(email: string): Promise<User | null> {
    const user = await this.drizzle.db
      .select()
      .from(schema.users)
      .where(and(eq(schema.users.email, email)));

    if (!user[0]) {
      return null;
    }

    return UserMapper.toDomain(user[0]);
  }
}
