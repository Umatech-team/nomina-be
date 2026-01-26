import { RefreshToken } from '@modules/user/entities/RefreshToken';
import { Prisma, RefreshToken as RefreshTokenPrisma } from '@prisma/client';

export class RefreshTokensPrismaMapper {
  static toEntity(raw: RefreshTokenPrisma): RefreshToken {
    return new RefreshToken(
      {
        userId: raw.userId,
        token: raw.token,
        expiresIn: raw.expiresIn,
        createdAt: raw.expiresIn,
      },
      raw.id,
    );
  }

  static toPrisma(
    refreshToken: RefreshToken,
  ): Prisma.RefreshTokenUncheckedCreateInput {
    return {
      id: refreshToken.id,
      userId: refreshToken.userId,
      token: refreshToken.token,
      expiresIn: refreshToken.expiresIn,
    };
  }
}
