import { env } from '@infra/env';
import { Injectable } from '@nestjs/common';
import { Decoder } from '@providers/cryptography/contracts/Decoder';
import { Encrypter } from '@providers/cryptography/contracts/Encrypter';
import { DateAddition } from '@providers/date/contracts/DateAddition';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { SessionExpiredError } from '../../../shared/errors/SessionExpiredError';
import { RefreshToken } from '../entities/RefreshToken';
import { MemberNotFoundError } from '../errors/MemberNotFoundError';
import { RefreshTokensRepository } from '../repositories/contracts/RefreshTokenRepository';
import { MemberRepository } from '../repositories/contracts/UserRepository';

type Request = string;

type Errors = MemberNotFoundError | SessionExpiredError;

type Response = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class RefreshTokenService implements Service<Request, Errors, Response> {
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly decrypter: Decoder,
    private readonly encrypter: Encrypter,
    private readonly dateAddition: DateAddition,
  ) {}

  async execute(
    refreshTokenReceived: Request,
  ): Promise<Either<Errors, Response>> {
    const { isValid, payload } =
      await this.decrypter.decrypt(refreshTokenReceived);

    if (!isValid || !payload) {
      return left(new SessionExpiredError());
    }

    const id = payload.sub;

    const member = await this.memberRepository.findUniqueById(Number(id));

    if (!member) {
      return left(new MemberNotFoundError());
    }

    const lastRefreshTokenSaved =
      await this.refreshTokensRepository.findUniqueByMemberIdAndToken(
        Number(id),
        refreshTokenReceived,
      );

    if (!lastRefreshTokenSaved) {
      return left(new SessionExpiredError());
    }

    await this.refreshTokensRepository.delete(lastRefreshTokenSaved.id);

    const accessToken = await this.encrypter.encrypt(
      {
        sub: member.id.toString(),
        role: member.role,
      },
      {
        expiresIn: env.JWT_MEMBER_ACCESS_EXPIRES_IN,
      },
    );

    const _refreshToken = await this.encrypter.encrypt(
      {
        sub: member.id.toString(),
      },
      {
        expiresIn: env.JWT_MEMBER_REFRESH_EXPIRES_IN,
      },
    );

    const refreshToken = new RefreshToken({
      memberId: member.id,
      token: _refreshToken,
      expiresIn: this.dateAddition.addDaysInCurrentDate(
        env.MEMBER_REFRESH_EXPIRES_IN,
      ),
    });

    await this.refreshTokensRepository.create(refreshToken);

    return right({
      accessToken,
      refreshToken: refreshToken.token,
    });
  }
}
