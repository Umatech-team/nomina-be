import { env } from '@infra/env';
import { RefreshToken } from '@modules/user/entities/RefreshToken';
import { RefreshTokensRepository } from '@modules/user/repositories/contracts/refresh-token.repository';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Encrypter } from '@providers/cryptography/contracts/Encrypter';
import { DateAddition } from '@providers/date/contracts/DateAddition';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { SwitchWorkspaceRequest } from './switch-workspace.dto';

type Request = SwitchWorkspaceRequest & Pick<TokenPayloadSchema, 'sub'>;

type Errors = HttpException;

type Response = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class SwitchWorkspaceService implements Service<
  Request,
  Errors,
  Response
> {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceUserRepository: WorkspaceUserRepository,
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
      return left(
        new HttpException('Workspace not found', statusCode.NOT_FOUND),
      );
    }

    const workspaceUser =
      await this.workspaceUserRepository.findUserByWorkspaceAndUserId(
        workspaceId,
        sub,
      );
    if (!workspaceUser) {
      return left(
        new HttpException('Workspace user not found', statusCode.NOT_FOUND),
      );
    }

    const user = await this.userRepository.findUniqueById(sub);
    if (!user) {
      return left(new HttpException('User not found', statusCode.NOT_FOUND));
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
