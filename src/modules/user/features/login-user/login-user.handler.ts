import { RefreshToken } from '@modules/user/entities/RefreshToken';
import { RefreshTokensRepository } from '@modules/user/repositories/contracts/refresh-token.repository';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { Encrypter } from '@providers/cryptography/contracts/Encrypter';
import { HashComparer } from '@providers/cryptography/contracts/HashComparer';
import { DateAddition } from '@providers/date/contracts/DateAddition';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { env } from 'process';
import { LoginUserRequest } from './login-user.dto';

type Request = LoginUserRequest;
type Errors = HttpException;
type Response = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class LoginUserHandler implements Service<Request, Errors, Response> {
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
  }: Request): Promise<Either<Errors, Response>> {
    const user = await this.userRepository.findUniqueByEmail(email);

    if (!user) {
      return left(new HttpException('Invalid credentials', 401));
    }

    const isPasswordValid = await this.hashComparer.compare(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return left(new HttpException('Invalid credentials', 401));
    }

    const defaultWorkspaceUser =
      await this.workspaceUserRepository.findDefaultByUserId(user.id);

    if (!defaultWorkspaceUser) {
      return left(new HttpException('Invalid credentials', 401));
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
