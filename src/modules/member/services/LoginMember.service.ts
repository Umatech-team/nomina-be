import { env } from '@infra/env';
import { Injectable } from '@nestjs/common';
import { Encrypter } from '@providers/cryptography/contracts/Encrypter';
import { HashComparer } from '@providers/cryptography/contracts/HashComparer';
import { DateAddition } from '@providers/date/contracts/DateAddition';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { LoginMemberDTO } from '../dto/LoginMemberDTO';
import { RefreshToken } from '../entities/RefreshToken';
import { WrongCredentialsError } from '../errors/WrongCredentialsError';
import { MemberRepository } from '../repositories/contracts/MemberRepository';
import { RefreshTokensRepository } from '../repositories/contracts/RefreshTokenRepository';

type Request = LoginMemberDTO;

type Errors = WrongCredentialsError;

type Response = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class LoginMemberService implements Service<Request, Errors, Response> {
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
    private readonly dateAddition: DateAddition,
  ) {}

  async execute({
    email,
    password,
  }: LoginMemberDTO): Promise<Either<WrongCredentialsError, Response>> {
    const member = await this.memberRepository.findUniqueByEmail(email);

    if (!member) {
      return left(new WrongCredentialsError());
    }

    const isPasswordValid = await this.hashComparer.compare(
      password,
      member.password,
    );

    if (!isPasswordValid) {
      return left(new WrongCredentialsError());
    }

    const accessToken = await this.encrypter.encrypt(
      {
        sub: member.id.toString(),
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
