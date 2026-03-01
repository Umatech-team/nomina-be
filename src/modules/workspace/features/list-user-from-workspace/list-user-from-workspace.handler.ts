import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { ListWorkspaceUsersRequest } from './list-user-from-workspace.dto';

type Request = ListWorkspaceUsersRequest & Pick<TokenPayloadSchema, 'sub'>;

type Errors = HttpException;

type Response = { workspaceUsers: WorkspaceUser[]; total: number };

@Injectable()
export class ListUsersFromWorkspaceHandler
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceUserRepository: WorkspaceUserRepository,
  ) {}

  async execute({
    workspaceId,
    page,
    pageSize,
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
        new HttpException(
          'User is not a member of the workspace',
          statusCode.FORBIDDEN,
        ),
      );
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
