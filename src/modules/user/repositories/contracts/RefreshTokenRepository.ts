import { RefreshToken } from '@modules/member/entities/RefreshToken';

export abstract class RefreshTokensRepository {
  abstract create(refreshToken: RefreshToken): Promise<void>;

  abstract findUniqueByMemberIdAndToken(
    memberId: number,
    token: string,
  ): Promise<RefreshToken | null>;

  abstract delete(id: number): Promise<void>;
}
