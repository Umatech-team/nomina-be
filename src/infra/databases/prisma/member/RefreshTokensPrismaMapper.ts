import { RefreshToken } from '@modules/member/entities/RefreshToken';
import { Prisma, RefreshToken as RefreshTokenPrisma } from '@prisma/client';

export class RefreshTokensPrismaMapper {
  static toEntity(raw: RefreshTokenPrisma): RefreshToken {
    return new RefreshToken(
      {
        memberId: raw.memberId,
        token: raw.token,
        expiresIn: raw.expiresIn,
        createdAt: raw.createdAt,
      },
      raw.id,
    );
  }

  static toPrisma(
    refreshToken: RefreshToken,
  ): Prisma.RefreshTokenUncheckedCreateInput {
    return {
      memberId: refreshToken.memberId,
      token: refreshToken.token,
      expiresIn: refreshToken.expiresIn,
      createdAt: refreshToken.createdAt,
    };
  }
}
