import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { AcceptWorkspaceInviteDTO } from '../dto/AcceptWorkspaceInviteDTO';
import { WorkspaceUser } from '../entities/WorkspaceUser';
import { ConflictWorkspaceUserError } from '../errors/ConflictWorkspaceUserError';
import { InvalidWorkspaceUserError } from '../errors/InvalidWorkspaceUserError';
import { InviteAlreadyUsedError } from '../errors/InviteAlreadyUsedError';
import { InviteExpiredError } from '../errors/InviteExpiredError';
import { InviteNotFoundError } from '../errors/InviteNotFoundError';
import { WorkspaceInviteRepository } from '../repositories/contracts/WorkspaceInviteRepository';
import { WorkspaceRepository } from '../repositories/contracts/WorkspaceRepository';

type Request = AcceptWorkspaceInviteDTO & Pick<TokenPayloadSchema, 'sub'>;

type Errors =
  | InviteNotFoundError
  | InviteExpiredError
  | InviteAlreadyUsedError
  | ConflictWorkspaceUserError
  | InvalidWorkspaceUserError;

type Response = { workspaceUser: WorkspaceUser };

@Injectable()
export class AcceptWorkspaceInviteService
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly workspaceInviteRepository: WorkspaceInviteRepository,
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  async execute({ code, sub }: Request): Promise<Either<Errors, Response>> {
    const invite =
      await this.workspaceInviteRepository.findDefaultByInviteCode(code);

    if (!invite) {
      return left(new InviteNotFoundError());
    }

    const now = new Date();
    if (invite.expiresAt < now) {
      return left(new InviteExpiredError());
    }

    if (invite.usedAt !== null) {
      return left(new InviteAlreadyUsedError());
    }

    const existingWorkspaceUser =
      await this.workspaceRepository.findUserByWorkspaceAndUserId(
        invite.workspaceId,
        sub,
      );

    if (existingWorkspaceUser) {
      return left(new ConflictWorkspaceUserError());
    }

    const workspaceUserOrError = WorkspaceUser.create({
      workspaceId: invite.workspaceId,
      userId: sub,
      role: invite.role,
      isDefault: false,
      joinedAt: new Date(),
    });

    if (workspaceUserOrError.isLeft()) {
      return left(workspaceUserOrError.value);
    }

    const workspaceUser = workspaceUserOrError.value;

    await this.workspaceRepository.addUser(workspaceUser);

    invite.usedAt = new Date();
    invite.usedBy = sub;

    await this.workspaceInviteRepository.update(invite);

    return right({ workspaceUser });
  }
}
