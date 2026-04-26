import { UserRole } from '@constants/enums';
import { Workspace } from '@modules/workspace/entities/Workspace';
import { WorkspaceNotFoundError } from '@modules/workspace/errors';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { FindWorkspaceRequest } from './find-workspace.dto';

type Request = FindWorkspaceRequest & Pick<TokenPayloadSchema, 'sub'>;

type Response = { workspace: Workspace; role: UserRole };

@Injectable()
export class FindWorkspaceByIdService implements Service<
  Request,
  Error,
  Response
> {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceUserRepository: WorkspaceUserRepository,
  ) {}

  async execute({
    workspaceId,
    sub,
  }: Request): Promise<Either<Error, Response>> {
    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      return left(new WorkspaceNotFoundError());
    }

    const workspaceUser =
      await this.workspaceUserRepository.findUserByWorkspaceAndUserId(
        workspaceId,
        sub,
      );

    if (!workspaceUser) {
      return left(new UnauthorizedError());
    }

    return right({
      workspace,
      role: workspaceUser.role,
    });
  }
}
