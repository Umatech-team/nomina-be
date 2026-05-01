import { UserRole } from '@constants/enums';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { UpdateWorkspaceUserRequest } from './update-workspace-user.dto';

type Request = UpdateWorkspaceUserRequest & Pick<TokenPayloadSchema, 'sub'>;

@Injectable()
export class UpdateWorkspaceUserService implements Service<
  Request,
  Error,
  WorkspaceUser
> {
  constructor(
    private readonly workspaceUserRepository: WorkspaceUserRepository,
  ) {}

  async execute({
    workspaceId,
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
        new UnauthorizedError('Usuário não tem acesso a esse workspace'),
      );
    }
    if (currentUserWorkspace.role === UserRole.OWNER) {
      return left(
        new UnauthorizedError('Não é possível alterar o papel do proprietário'),
      );
    }

    if (role === UserRole.OWNER) {
      return left(
        new UnauthorizedError(
          'Não é possível promover um usuário a proprietário',
        ),
      );
    }

    currentUserWorkspace.changeRole(role);

    const updatedWorkspaceUser =
      await this.workspaceUserRepository.updateUser(currentUserWorkspace);

    return right(updatedWorkspaceUser);
  }
}
