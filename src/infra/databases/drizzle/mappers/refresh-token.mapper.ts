import * as schema from '@infra/databases/drizzle/schema';
import { RefreshToken } from '@modules/user/entities/RefreshToken';

type RefreshTokenDrizzle = typeof schema.refreshTokens.$inferSelect;
type RefreshTokenDrizzleInsert = typeof schema.refreshTokens.$inferInsert;

export class RefreshTokenMapper {
  static toDomain(raw: RefreshTokenDrizzle): RefreshToken {
    return RefreshToken.restore(
      {
        userId: raw.userId,
        token: raw.token,
        expiresIn: raw.expiresIn,
      },
      raw.id,
    );
  }

  static toDatabase(entity: RefreshToken): RefreshTokenDrizzleInsert {
    return {
      id: entity.id,
      userId: entity.userId,
      token: entity.token,
      expiresIn: entity.expiresIn,
    };
  }
}
