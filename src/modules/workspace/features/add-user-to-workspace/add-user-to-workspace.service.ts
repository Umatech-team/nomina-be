import { UserNotFoundError } from '@modules/user/errors';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { ConflictWorkspaceUserError } from '@modules/workspace/errors';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { AddWorkspaceUserRequest } from './add-user-to-workspace.dto';

type Request = AddWorkspaceUserRequest & Pick<TokenPayloadSchema, 'sub'>;

@Injectable()
export class AddUserToWorkspaceService implements Service<
  Request,
  Error,
  WorkspaceUser
> {
  constructor(
    private readonly workspaceUserRepository: WorkspaceUserRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({
    workspaceId,
    userId,
    role,
    sub,
  }: Request): Promise<Either<Error, WorkspaceUser>> {
    const currentUserWorkspace =
      await this.workspaceUserRepository.findUserByWorkspaceAndUserId(
        workspaceId,
        sub,
      );
    if (!currentUserWorkspace) {
      return left(
        new UnauthorizedError('Usuário atual não é membro do workspace.'),
      );
    }

    const targetUser = await this.userRepository.findUniqueById(userId);
    if (!targetUser) {
      return left(new UserNotFoundError());
    }

    const existingWorkspaceUser =
      await this.workspaceUserRepository.findUserByWorkspaceAndUserId(
        workspaceId,
        userId,
      );
    if (existingWorkspaceUser) {
      return left(new ConflictWorkspaceUserError());
    }

    const workspaceUserOrError = WorkspaceUser.create({
      workspaceId,
      userId,
      role,
      isDefault: false,
    });
    if (workspaceUserOrError.isLeft()) {
      return left(workspaceUserOrError.value);
    }

    const workspaceUser = workspaceUserOrError.value;

    await this.workspaceUserRepository.addUserToWorkspace(workspaceUser);

    return right(workspaceUser);
  }
}
