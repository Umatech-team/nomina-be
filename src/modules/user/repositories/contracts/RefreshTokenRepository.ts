import { RefreshToken } from '@modules/user/entities/RefreshToken';

export abstract class RefreshTokensRepository {
  abstract create(refreshToken: RefreshToken): Promise<void>;

  abstract findUniqueByUserIdAndToken(
    userId: number,
    token: string,
  ): Promise<RefreshToken | null>;

  abstract delete(id: number): Promise<void>;
}
