import { UserRole } from '@constants/enums';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { UpdateWorkspaceUserRequest } from './update-workspace-user.dto';

type Request = UpdateWorkspaceUserRequest & Pick<TokenPayloadSchema, 'sub'>;

type Errors = HttpException;

type Response = WorkspaceUser;

@Injectable()
export class UpdateWorkspaceUserHandler implements Service<
  Request,
  Errors,
  Response
> {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceUserRepository: WorkspaceUserRepository,
  ) {}

  async execute({
    workspaceId,
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
          'User does not belong to this workspace',
          statusCode.FORBIDDEN,
        ),
      );
    }
    if (currentUserWorkspace.role === UserRole.OWNER) {
      return left(
        new HttpException(
          'Cannot change the role of the owner',
          statusCode.FORBIDDEN,
        ),
      );
    }

    if (role === UserRole.OWNER) {
      return left(
        new HttpException('Cannot promote user to owner', statusCode.FORBIDDEN),
      );
    }

    currentUserWorkspace.role = role;

    const updatedWorkspaceUser =
      await this.workspaceUserRepository.updateUser(currentUserWorkspace);

    return right(updatedWorkspaceUser);
  }
}
