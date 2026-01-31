import { RefreshToken } from '@modules/user/entities/RefreshToken';

export abstract class RefreshTokensRepository {
  abstract create(refreshToken: RefreshToken): Promise<void>;

  abstract findUniqueByUserIdAndToken(
    userId: string,
    token: string,
  ): Promise<RefreshToken | null>;

  abstract delete(id: string): Promise<void>;
  abstract deleteManyByUserId(userId: string): Promise<void>;
}
