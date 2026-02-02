import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { ListWorkspaceUsersDTO } from '../dto/ListWorkspaceUsersDTO';
import { WorkspaceUser } from '../entities/WorkspaceUser';
import { WorkspaceNotFoundError } from '../errors/WorkspaceNotFoundError';
import { WorkspaceRepository } from '../repositories/contracts/WorkspaceRepository';

type Request = ListWorkspaceUsersDTO & Pick<TokenPayloadSchema, 'sub'>;

type Errors = WorkspaceNotFoundError | UnauthorizedError;

type Response = { workspaceUsers: WorkspaceUser[]; total: number };

@Injectable()
export class ListWorkspaceUsersService
  implements Service<Request, Errors, Response>
{
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async execute({
    workspaceId,
    page,
    pageSize,
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

    const result = await this.workspaceRepository.findUsersByWorkspaceId(
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
