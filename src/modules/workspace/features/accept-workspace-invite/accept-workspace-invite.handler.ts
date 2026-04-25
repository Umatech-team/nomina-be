import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { WorkspaceInviteRepository } from '@modules/workspace/repositories/contracts/WorkspaceInviteRepository';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { AcceptWorkspaceInviteRequest } from './accept-workspace-invite.dto';

type Request = AcceptWorkspaceInviteRequest & Pick<TokenPayloadSchema, 'sub'>;

type Errors = HttpException;

type Response = WorkspaceUser;

@Injectable()
export class AcceptWorkspaceInviteService implements Service<
  Request,
  Errors,
  Response
> {
  constructor(
    private readonly workspaceInviteRepository: WorkspaceInviteRepository,
    private readonly workspaceUserRepository: WorkspaceUserRepository,
  ) {}

  async execute({ code, sub }: Request): Promise<Either<Errors, Response>> {
    const invite = await this.workspaceInviteRepository.findByCode(code);

    if (!invite) {
      return left(new HttpException('Invite not found', statusCode.NOT_FOUND));
    }

    const now = new Date();
    if (invite.expiresAt < now) {
      return left(new HttpException('Invite expired', statusCode.BAD_REQUEST));
    }

    if (invite.usedAt !== null) {
      return left(
        new HttpException('Invite already used', statusCode.BAD_REQUEST),
      );
    }

    const isAlreadyMember =
      await this.workspaceUserRepository.findUserByWorkspaceAndUserId(
        invite.workspaceId,
        sub,
      );

    if (isAlreadyMember) {
      return left(
        new HttpException(
          'User already a member of the workspace',
          statusCode.CONFLICT,
        ),
      );
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

    await this.workspaceUserRepository.addUserToWorkspace(workspaceUser);

    await this.workspaceInviteRepository.markAsUsed(invite.id, sub);

    return right(workspaceUser);
  }
}
