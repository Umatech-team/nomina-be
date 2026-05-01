import { UserRole } from '@constants/enums';
import { UserNotFoundError } from '@modules/user/errors';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import { WorkspaceInvite } from '@modules/workspace/entities/WorkspaceInvite';
import {
  InvalidWorkspaceInviteError,
  WorkspaceNotFoundError,
} from '@modules/workspace/errors';
import { WorkspaceInviteRepository } from '@modules/workspace/repositories/contracts/WorkspaceInviteRepository';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { CreateWorkspaceInviteRequest } from './create-workspace-invite.dto';

type Request = CreateWorkspaceInviteRequest & TokenPayloadSchema;

@Injectable()
export class CreateWorkspaceInviteService implements Service<
  Request,
  Error,
  WorkspaceInvite
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly workspaceUserRepository: WorkspaceUserRepository,
    private readonly workspaceInviteRepository: WorkspaceInviteRepository,
  ) {}

  async execute({
    role,
    sub,
    workspaceId,
  }: Request): Promise<Either<Error, WorkspaceInvite>> {
    const user = await this.userRepository.findUniqueById(sub);
    if (!user) {
      return left(new UserNotFoundError());
    }

    const workspaceUser =
      await this.workspaceUserRepository.findUserByWorkspaceAndUserId(
        workspaceId,
        sub,
      );
    if (!workspaceUser) {
      return left(new WorkspaceNotFoundError());
    }

    if (role !== UserRole.ADMIN && role !== UserRole.USER) {
      return left(new InvalidWorkspaceInviteError());
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 2);

    const inviteOrError = WorkspaceInvite.create({
      code: crypto.randomUUID().substring(0, 8).toUpperCase(),
      workspaceId,
      role,
      createdBy: user.id,
      expiresAt,
    });

    if (inviteOrError.isLeft()) {
      return left(inviteOrError.value);
    }

    const workspaceInvite = await this.workspaceInviteRepository.create(
      inviteOrError.value,
    );

    return right(workspaceInvite);
  }
}
