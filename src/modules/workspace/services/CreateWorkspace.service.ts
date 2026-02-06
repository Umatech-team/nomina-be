import { UserRole } from '@constants/enums';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { CreateWorkspaceDTO } from '../dto/CreateWorkspaceDTO';
import { Workspace } from '../entities/Workspace';
import { WorkspaceUser } from '../entities/WorkspaceUser';
import { InvalidWorkspaceError } from '../errors/InvalidWorkspaceError';
import { InvalidWorkspaceUserError } from '../errors/InvalidWorkspaceUserError';
import { WorkspaceRepository } from '../repositories/contracts/WorkspaceRepository';

type Request = CreateWorkspaceDTO & Pick<TokenPayloadSchema, 'sub'>;

type Errors = InvalidWorkspaceError | InvalidWorkspaceUserError;

type Response = {
  workspace: Workspace;
  workspaceUser: WorkspaceUser;
};

@Injectable()
export class CreateWorkspaceService
  implements Service<Request, Errors, Response>
{
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async execute({
    currency = 'BRL',
    name,
    isDefault,
    sub,
  }: Request): Promise<Either<Errors, Response>> {
    const workspaceOrError = Workspace.create({
      name,
      currency,
    });

    if (workspaceOrError.isLeft()) {
      return left(workspaceOrError.value);
    }

    const workspace = workspaceOrError.value;

    const workspaceUserOrError = WorkspaceUser.create({
      userId: sub,
      workspaceId: workspace.id,
      role: UserRole.OWNER,
      isDefault: !!isDefault,
      joinedAt: new Date(),
    });

    if (workspaceUserOrError.isLeft()) {
      return left(workspaceUserOrError.value);
    }

    const workspaceUser = workspaceUserOrError.value;

    await this.workspaceRepository.createWithOwnerAndAccount(
      workspace,
      workspaceUser,
    );

    return right({
      workspace,
      workspaceUser,
    });
  }
}
