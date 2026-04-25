import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { AddWorkspaceUserRequest } from './add-user-to-workspace.dto';

type Request = AddWorkspaceUserRequest & Pick<TokenPayloadSchema, 'sub'>;

type Errors = HttpException;

type Response = WorkspaceUser;

@Injectable()
export class AddUserToWorkspaceService implements Service<
  Request,
  Errors,
  Response
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
  }: Request): Promise<Either<Errors, Response>> {
    const currentUserWorkspace =
      await this.workspaceUserRepository.findUserByWorkspaceAndUserId(
        workspaceId,
        sub,
      );
    if (!currentUserWorkspace) {
      return left(
        new HttpException(
          'Current user is not a member of the workspace or workspace not found',
          statusCode.FORBIDDEN,
        ),
      );
    }

    const targetUser = await this.userRepository.findUniqueById(userId);
    if (!targetUser) {
      return left(new HttpException('User not found', statusCode.NOT_FOUND));
    }

    const existingWorkspaceUser =
      await this.workspaceUserRepository.findUserByWorkspaceAndUserId(
        workspaceId,
        userId,
      );
    if (existingWorkspaceUser) {
      return left(
        new HttpException(
          'User is already a member of the workspace',
          statusCode.CONFLICT,
        ),
      );
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
