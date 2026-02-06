import { env } from '@infra/env';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { Injectable } from '@nestjs/common';
import { Encrypter } from '@providers/cryptography/contracts/Encrypter';
import { HashComparer } from '@providers/cryptography/contracts/HashComparer';
import { DateAddition } from '@providers/date/contracts/DateAddition';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { LoginUserDTO } from '../dto/LoginMemberDTO';
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
    private readonly workspaceUserRepository: WorkspaceUserRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
    private readonly dateAddition: DateAddition,
  ) {}

  async execute({
    email,
    password,
  }: LoginUserDTO): Promise<Either<WrongCredentialsError, Response>> {
    const user = await this.userRepository.findUniqueByEmail(email);

    if (!user) {
      return left(new WrongCredentialsError());
    }

    const isPasswordValid = await this.hashComparer.compare(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return left(new WrongCredentialsError());
    }

    const defaultWorkspaceUser =
      await this.workspaceUserRepository.findDefaultByUserId(user.id);

    if (!defaultWorkspaceUser) {
      return left(new WrongCredentialsError());
    }

    const accessToken = await this.encrypter.encrypt(
      {
        sub: user.id,
        name: user.name,
        workspaceId: defaultWorkspaceUser.member.workspaceId,
        workspaceName: defaultWorkspaceUser.workspaceName,
        role: defaultWorkspaceUser.member.role,
      },
      {
        expiresIn: env.JWT_USER_ACCESS_EXPIRES_IN,
      },
    );

    const _refreshToken = await this.encrypter.encrypt(
      {
        sub: user.id,
      },
      {
        expiresIn: env.JWT_USER_REFRESH_EXPIRES_IN,
      },
    );

    const expiresInDays = Number(env.USER_REFRESH_EXPIRES_IN);

    const refreshToken = RefreshToken.create({
      userId: user.id,
      token: _refreshToken,
      expiresIn: this.dateAddition.addDaysInCurrentDate(expiresInDays),
    });

    await this.refreshTokensRepository.deleteManyByUserId(user.id);

    await this.refreshTokensRepository.create(refreshToken);

    return right({
      accessToken,
      refreshToken: refreshToken.token,
    });
  }
}
