import { UserRole } from '@constants/enums';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import { WorkspaceInvite } from '@modules/workspace/entities/WorkspaceInvite';
import { WorkspaceInviteRepository } from '@modules/workspace/repositories/contracts/WorkspaceInviteRepository';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { CreateWorkspaceInviteRequest } from './create-workspace-invite.dto';

type Request = CreateWorkspaceInviteRequest & TokenPayloadSchema;

type Errors = HttpException;

type Response = WorkspaceInvite;

@Injectable()
export class CreateWorkspaceInviteService implements Service<
  Request,
  Errors,
  Response
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly workspaceRepository: WorkspaceRepository,
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
      return left(new HttpException('User not found', statusCode.NOT_FOUND));
    }

    const workspaceUser =
      await this.workspaceUserRepository.findUserByWorkspaceAndUserId(
        workspaceId,
        sub,
      );
    if (!workspaceUser) {
      return left(
        new HttpException('Workspace user not found', statusCode.NOT_FOUND),
      );
    }

    if (role !== UserRole.ADMIN && role !== UserRole.USER) {
      return left(
        new HttpException(
          'A função do convite deve ser ADMIN ou USER',
          statusCode.BAD_REQUEST,
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

    return right(workspaceInvite);
  }
}
