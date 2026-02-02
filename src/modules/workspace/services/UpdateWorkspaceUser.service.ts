import { UserRole } from '@constants/enums';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { UpdateWorkspaceUserDTO } from '../dto/UpdateWorkspaceUserDTO';
import { WorkspaceUser } from '../entities/WorkspaceUser';
import { InvalidWorkspaceUserError } from '../errors/InvalidWorkspaceUserError';
import { WorkspaceUserNotFoundError } from '../errors/WorkspaceUserNotFoundError';
import { WorkspaceRepository } from '../repositories/contracts/WorkspaceRepository';

type Request = UpdateWorkspaceUserDTO & Pick<TokenPayloadSchema, 'sub'>;

type Errors =
  | WorkspaceUserNotFoundError
  | UnauthorizedError
  | InvalidWorkspaceUserError;

type Response = { workspaceUser: WorkspaceUser };

@Injectable()
export class UpdateWorkspaceUserService
  implements Service<Request, Errors, Response>
{
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async execute({
    workspaceUserId,
    role,
    sub,
  }: Request): Promise<Either<Errors, Response>> {
    const workspaceUser =
      await this.workspaceRepository.findUserById(workspaceUserId);

    if (!workspaceUser) {
      return left(new WorkspaceUserNotFoundError());
    }

    const currentUserWorkspace =
      await this.workspaceRepository.findUserByWorkspaceAndUserId(
        workspaceUser.workspaceId,
        sub,
      );

    if (!currentUserWorkspace) {
      return left(new UnauthorizedError());
    }

    if (
      currentUserWorkspace.role !== UserRole.OWNER &&
      currentUserWorkspace.role !== UserRole.ADMIN
    ) {
      return left(new UnauthorizedError());
    }

    if (workspaceUser.role === UserRole.OWNER) {
      return left(
        new InvalidWorkspaceUserError(
          'Não é possível alterar a função do proprietário',
        ),
      );
    }

    if (role === UserRole.OWNER) {
      return left(
        new InvalidWorkspaceUserError(
          'Não é possível promover usuário para proprietário',
        ),
      );
    }

    workspaceUser.role = role;

    await this.workspaceRepository.updateUser(workspaceUser);

    return right({ workspaceUser });
  }
}
