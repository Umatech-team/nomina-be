import { UserRole } from '@constants/enums';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { FindWorkspaceByIdDTO } from '../dto/FindWorkspaceByIdDTO';
import { Workspace } from '../entities/Workspace';
import { WorkspaceNotFoundError } from '../errors/WorkspaceNotFoundError';
import { WorkspaceRepository } from '../repositories/contracts/WorkspaceRepository';

type Request = FindWorkspaceByIdDTO & Pick<TokenPayloadSchema, 'sub'>;

type Errors = WorkspaceNotFoundError | UnauthorizedError;

type Response = { workspace: Workspace; role: UserRole };

@Injectable()
export class FindWorkspaceByIdService
  implements Service<Request, Errors, Response>
{
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

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

    return right({
      workspace,
      role: workspaceUser.role,
    });
  }
}
