import { WorkspaceUserNotFoundError } from '@modules/workspace/errors';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { SetDefaultWorkspaceRequest } from './set-default-workspace.dto';

type Request = SetDefaultWorkspaceRequest & Pick<TokenPayloadSchema, 'sub'>;

@Injectable()
export class SetDefaultWorkspaceService implements Service<
  Request,
  Error,
  void
> {
  constructor(
    private readonly workspaceUserRepository: WorkspaceUserRepository,
  ) {}

  async execute({ workspaceId, sub }: Request): Promise<Either<Error, void>> {
    const membership =
      await this.workspaceUserRepository.findUserByWorkspaceAndUserId(
        workspaceId,
        sub,
      );

    if (!membership) {
      return left(new WorkspaceUserNotFoundError());
    }

    await this.workspaceUserRepository.setDefaultWorkspace(sub, workspaceId);

    return right(undefined);
  }
}
