import {
  CannotDeleteDefaultWorkspaceError,
  WorkspaceNotFoundError,
  WorkspaceUserNotFoundError,
} from '@modules/workspace/errors';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { DeleteWorkspaceRequest } from './delete-workspace.dto';

type Request = DeleteWorkspaceRequest & Pick<TokenPayloadSchema, 'sub'>;

@Injectable()
export class DeleteWorkspaceService implements Service<Request, Error, void> {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceUserRepository: WorkspaceUserRepository,
  ) {}

  async execute({ workspaceId, sub }: Request): Promise<Either<Error, void>> {
    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      return left(new WorkspaceNotFoundError());
    }

    const membership =
      await this.workspaceUserRepository.findUserByWorkspaceAndUserId(
        workspaceId,
        sub,
      );

    if (!membership) {
      return left(new WorkspaceUserNotFoundError());
    }

    if (membership.isDefault) {
      return left(new CannotDeleteDefaultWorkspaceError());
    }

    await this.workspaceRepository.delete(workspaceId);

    return right(undefined);
  }
}
