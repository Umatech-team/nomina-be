import { env } from '@infra/env';
import { RefreshToken } from '@modules/user/entities/RefreshToken';
import { UserNotFoundError } from '@modules/user/errors';
import { RefreshTokensRepository } from '@modules/user/repositories/contracts/refresh-token.repository';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { Decoder } from '@providers/cryptography/contracts/Decoder';
import { Encrypter } from '@providers/cryptography/contracts/Encrypter';
import { DayJsDateProvider } from '@providers/date/implementations/Dayjs';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { SessionExpiredError } from '@shared/errors/SessionExpiredError';

type Response = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class RefreshTokenService implements Service<string, Error, Response> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly decrypter: Decoder,
    private readonly encrypter: Encrypter,
    private readonly dateProvider: DayJsDateProvider,
    private readonly workspaceUserRepository: WorkspaceUserRepository,
  ) {}

  async execute(refreshToken: string): Promise<Either<Error, Response>> {
    const { isValid, payload } = await this.decrypter.decrypt(refreshToken);

    if (!isValid || !payload) {
      return left(new SessionExpiredError());
    }

    const id = payload.sub;

    const user = await this.userRepository.findUniqueById(id);

    if (!user) {
      return left(new UserNotFoundError());
    }

    const lastRefreshTokenSaved =
      await this.refreshTokensRepository.findUniqueByUserIdAndToken(
        id,
        refreshToken,
      );

    if (!lastRefreshTokenSaved) {
      return left(new SessionExpiredError());
    }

    this.refreshTokensRepository.delete(lastRefreshTokenSaved.id);

    const defaultWorkspaceUser =
      await this.workspaceUserRepository.findDefaultWorkspaceByUserId(user.id);

    if (!defaultWorkspaceUser) {
      return left(new SessionExpiredError());
    }

    const accessToken = await this.encrypter.encrypt(
      {
        sub: user.id,
        name: user.name,
        workspaceId: defaultWorkspaceUser.user.workspaceId,
        workspaceName: defaultWorkspaceUser.workspaceName,
        role: defaultWorkspaceUser.user.role,
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
      expiresIn: this.dateProvider.addDaysInCurrentDate(
        env.USER_REFRESH_EXPIRES_IN,
      ),
    });
    if (createdRefreshToken.isLeft()) {
      return left(new HttpException(createdRefreshToken.value.message, 400));
    }

    await this.refreshTokensRepository.create(createdRefreshToken.value);

    return right({
      accessToken,
      refreshToken: createdRefreshToken.value.token,
    });
  }
}
