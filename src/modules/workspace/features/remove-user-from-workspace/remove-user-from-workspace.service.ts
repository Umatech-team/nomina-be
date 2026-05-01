import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { RemoveWorkspaceRequest } from './remove-user-from-workspace.dto';
import { WorkspaceUserNotFoundError } from '@modules/workspace/errors';

type Request = RemoveWorkspaceRequest & Pick<TokenPayloadSchema, 'workspaceId'>;

@Injectable()
export class RemoveUserFromWorkspaceService implements Service<
  Request,
  Error,
  void
> {
  constructor(
    private readonly workspaceUserRepository: WorkspaceUserRepository,
  ) {}

  async execute({
    userId,
    workspaceId,
  }: Request): Promise<Either<Error, void>> {
    const currentUserWorkspace =
      await this.workspaceUserRepository.findUserByWorkspaceAndUserId(
        workspaceId,
        userId,
      );

    if (!currentUserWorkspace) {
      return left(new WorkspaceUserNotFoundError());
    }

    await this.workspaceUserRepository.removeUserFromWorkspace(
      currentUserWorkspace.id,
    );

    return right(undefined);
  }
}
