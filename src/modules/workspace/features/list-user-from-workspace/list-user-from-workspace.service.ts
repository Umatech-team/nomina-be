import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { WorkspaceNotFoundError } from '@modules/workspace/errors';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { ListWorkspaceUsersRequest } from './list-user-from-workspace.dto';

type Request = ListWorkspaceUsersRequest & Pick<TokenPayloadSchema, 'sub'>;

type Response = { workspaceUsers: WorkspaceUser[]; total: number };

@Injectable()
export class ListUsersFromWorkspaceService implements Service<
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
    page,
    pageSize,
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

    const result = await this.workspaceUserRepository.findUsersByWorkspaceId(
      workspaceId,
      page,
      pageSize,
    );

    return right({
      workspaceUsers: result.workspaceUsers,
      total: result.total,
    });
  }
}
