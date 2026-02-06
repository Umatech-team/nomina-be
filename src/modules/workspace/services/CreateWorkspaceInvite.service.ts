import { UserRole } from '@constants/enums';
import { UserRepository } from '@modules/user/repositories/contracts/UserRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { CreateWorkspaceInviteDTO } from '../dto/CreateWorkspaceInviteDTO';
import { WorkspaceInvite } from '../entities/WorkspaceInvite';
import { InvalidWorkspaceInviteError } from '../errors/InvalidWorkspaceInviteError';
import { InvalidWorkspaceUserError } from '../errors/InvalidWorkspaceUserError';
import { WorkspaceInviteRepository } from '../repositories/contracts/WorkspaceInviteRepository';
import { WorkspaceUserRepository } from '../repositories/contracts/WorkspaceUserRepository';

type Request = CreateWorkspaceInviteDTO & TokenPayloadSchema;

type Errors = InvalidWorkspaceInviteError | InvalidWorkspaceUserError;

type Response = {
  workspaceInvite: WorkspaceInvite;
};

@Injectable()
export class CreateWorkspaceInviteService
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly workspaceUserRepository: WorkspaceUserRepository,
    private readonly workspaceInviteRepository: WorkspaceInviteRepository,
  ) {}

  async execute({
    role,
    sub,
    workspaceId,
  }: Request): Promise<Either<Errors, Response>> {
    const user = await this.userRepository.findUniqueById(sub);

    if (!user) {
      return left(new UnauthorizedError());
    }

    const workspaceUser =
      await this.workspaceUserRepository.findUniqueById(workspaceId);

    if (!workspaceUser) {
      return left(new UnauthorizedError());
    }

    if (workspaceUser.userId !== user.id) {
      return left(new UnauthorizedError());
    }

    if (workspaceUser.role !== UserRole.OWNER) {
      return left(new UnauthorizedError());
    }

    if (role !== UserRole.ADMIN && role !== UserRole.USER) {
      return left(
        new InvalidWorkspaceInviteError(
          'A função do convite deve ser ADMIN ou USER',
        ),
      );
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

    return right({
      workspaceInvite,
    });
  }
}
