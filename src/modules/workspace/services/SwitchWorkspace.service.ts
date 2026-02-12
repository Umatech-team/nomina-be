import { env } from '@infra/env';
import { RefreshToken } from '@modules/user/entities/RefreshToken';
import { RefreshTokensRepository } from '@modules/user/repositories/contracts/RefreshTokenRepository';
import { UserRepository } from '@modules/user/repositories/contracts/UserRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Encrypter } from '@providers/cryptography/contracts/Encrypter';
import { DateAddition } from '@providers/date/contracts/DateAddition';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { SwitchWorkspaceDTO } from '../dto/SwitchWorkspaceDTO';
import { WorkspaceNotFoundError } from '../errors/WorkspaceNotFoundError';
import { WorkspaceRepository } from '../repositories/contracts/WorkspaceRepository';

type Request = SwitchWorkspaceDTO & Pick<TokenPayloadSchema, 'sub'>;

type Errors = WorkspaceNotFoundError | UnauthorizedError;

type Response = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class SwitchWorkspaceService
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly userRepository: UserRepository,
    private readonly encrypter: Encrypter,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly dateAddition: DateAddition,
  ) {}

  async execute({
    workspaceId,
    sub,
  }: Request): Promise<Either<Errors, Response>> {
    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      return left(new WorkspaceNotFoundError());
    }

    const workspaceUser =
      await this.workspaceRepository.findUserByWorkspaceAndUserId(
        workspaceId,
        sub,
      );

    if (!workspaceUser) {
      return left(new UnauthorizedError());
    }

    const user = await this.userRepository.findUniqueById(sub);

    if (!user) {
      return left(new UnauthorizedError());
    }

    await this.refreshTokensRepository.deleteManyByUserId(sub);

    const accessToken = await this.encrypter.encrypt(
      {
        sub: user.id,
        name: user.name,
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        role: workspaceUser.role,
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

    await this.refreshTokensRepository.create(refreshToken);

    return right({
      accessToken,
      refreshToken: refreshToken.token,
    });
  }
}
