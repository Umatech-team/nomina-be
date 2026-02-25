import { DrizzleService } from '@infra/databases/drizzle/drizzle.service';
import { RefreshToken } from '@modules/user/entities/RefreshToken';
import { RefreshTokensRepository } from '@modules/user/repositories/contracts/refresh-token.repository';
import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { RefreshTokenMapper } from '../mappers/refresh-token.mapper';
import * as schema from '../schema';

@Injectable()
export class RefreshTokenRepositoryImplementation
  implements RefreshTokensRepository
{
  constructor(private readonly drizzle: DrizzleService) {}
  async create(refreshToken: RefreshToken): Promise<void> {
    await this.drizzle.db.insert(schema.refreshTokens).values({
      id: refreshToken.id,
      userId: refreshToken.userId,
      token: refreshToken.token,
      expiresIn: refreshToken.expiresIn,
      createdAt: refreshToken.createdAt,
    });
  }

  async findUniqueByUserIdAndToken(
    userId: string,
    token: string,
  ): Promise<RefreshToken | null> {
    const refresToken = await this.drizzle.db
      .select()
      .from(schema.refreshTokens)
      .where(
        and(
          eq(schema.refreshTokens.userId, userId),
          eq(schema.refreshTokens.token, token),
        ),
      );

    return refresToken.length
      ? RefreshTokenMapper.toDomain(refresToken[0])
      : null;
  }

  async delete(id: string): Promise<void> {
    await this.drizzle.db
      .delete(schema.refreshTokens)
      .where(eq(schema.refreshTokens.id, id));
  }

  async deleteManyByUserId(userId: string): Promise<void> {
    await this.drizzle.db
      .delete(schema.refreshTokens)
      .where(eq(schema.refreshTokens.userId, userId));
  }
}
