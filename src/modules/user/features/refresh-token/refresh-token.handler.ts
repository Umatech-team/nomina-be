import { env } from '@infra/env';
import { RefreshToken } from '@modules/user/entities/RefreshToken';
import { RefreshTokensRepository } from '@modules/user/repositories/contracts/refresh-token.repository';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { Decoder } from '@providers/cryptography/contracts/Decoder';
import { Encrypter } from '@providers/cryptography/contracts/Encrypter';
import { DateAddition } from '@providers/date/contracts/DateAddition';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';

type Request = string;
type Errors = HttpException;
type Response = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class RefreshTokenHandler implements Service<Request, Errors, Response> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly decrypter: Decoder,
    private readonly encrypter: Encrypter,
    private readonly dateAddition: DateAddition,
    private readonly workspaceUserRepository: WorkspaceUserRepository,
  ) {}

  async execute(refreshToken: string): Promise<Either<Errors, Response>> {
    const { isValid, payload } = await this.decrypter.decrypt(refreshToken);

    if (!isValid || !payload) {
      return left(new HttpException('Session expired', 401));
    }

    const id = payload.sub;

    const user = await this.userRepository.findUniqueById(id);

    if (!user) {
      return left(new HttpException('User not found', 404));
    }

    const lastRefreshTokenSaved =
      await this.refreshTokensRepository.findUniqueByUserIdAndToken(
        id,
        refreshToken,
      );

    if (!lastRefreshTokenSaved) {
      return left(new HttpException('Session expired', 401));
    }

    this.refreshTokensRepository.delete(lastRefreshTokenSaved.id);

    const defaultWorkspaceUser =
      await this.workspaceUserRepository.findDefaultByUserId(user.id);

    if (!defaultWorkspaceUser) {
      return left(new HttpException('Session expired', 401));
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
        sub: user.id.toString(),
      },
      {
        expiresIn: env.JWT_USER_REFRESH_EXPIRES_IN,
      },
    );

    const createdRefreshToken = RefreshToken.create({
      userId: user.id,
      token: _refreshToken,
      expiresIn: this.dateAddition.addDaysInCurrentDate(
        env.USER_REFRESH_EXPIRES_IN,
      ),
    });

    await this.refreshTokensRepository.create(createdRefreshToken);

    return right({
      accessToken,
      refreshToken: createdRefreshToken.token,
    });
  }
}
