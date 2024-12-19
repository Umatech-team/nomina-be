import { env } from '@infra/env';
import { Injectable } from '@nestjs/common';
import { Encrypter } from '@providers/cryptography/contracts/Encrypter';
import { HashComparer } from '@providers/cryptography/contracts/HashComparer';
import { DateAddition } from '@providers/date/contracts/DateAddition';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { LoginUserDTO } from '../dto/LoginUserDTO';
import { RefreshToken } from '../entities/RefreshToken';
import { WrongCredentialsError } from '../errors/WrongCredentialsError';
import { RefreshTokensRepository } from '../repositories/contracts/RefreshTokenRepository';
import { UserRepository } from '../repositories/contracts/UserRepository';

type Request = LoginUserDTO;

type Errors = WrongCredentialsError;

type Response = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class LoginUserService implements Service<Request, Errors, Response> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
    private readonly dateAddition: DateAddition,
  ) {}

  async execute({
    name,
    password,
  }: LoginUserDTO): Promise<Either<WrongCredentialsError, Response>> {
    const user = await this.userRepository.findUniqueByName(name);

    if (!user) {
      return left(new WrongCredentialsError());
    }

    const isPasswordValid = await this.hashComparer.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return left(new WrongCredentialsError());
    }

    const accessToken = await this.encrypter.encrypt(
      {
        sub: user.id.toString(),
      },
      {
        expiresIn: env.JWT_USER_ACCESS_EXPIRES_IN,
      },
    );

    const _refreshToken = await this.encrypter.encrypt(
      {
        sub: user.id.toString(),
      },
      {
        expiresIn: env.JWT_USER_REFRESH_EXPIRES_IN,
      },
    );

    const refreshToken = new RefreshToken({
      userId: user.id,
      token: _refreshToken,
      expiresIn: this.dateAddition.addDaysInCurrentDate(
        env.PLAYER_REFRESH_EXPIRES_IN,
      ),
    });

    await this.refreshTokensRepository.create(refreshToken);

    return right({
      accessToken,
      refreshToken: refreshToken.token,
    });
  }
}
