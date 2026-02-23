import { UserRole } from '@constants/enums';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { FindWorkspaceUserByIdDTO } from '../dto/FindWorkspaceUserByIdDTO';
import { CannotRemoveOwnerError } from '../errors/CannotRemoveOwnerError';
import { InvalidWorkspaceUserError } from '../errors/InvalidWorkspaceUserError';
import { WorkspaceUserNotFoundError } from '../errors/WorkspaceUserNotFoundError';
import { WorkspaceRepository } from '../repositories/contracts/WorkspaceRepository';

type Request = FindWorkspaceUserByIdDTO &
  Pick<TokenPayloadSchema, 'workspaceId'>;

type Errors =
  | WorkspaceUserNotFoundError
  | UnauthorizedError
  | InvalidWorkspaceUserError
  | CannotRemoveOwnerError;

type Response = { success: boolean };

@Injectable()
export class RemoveUserFromWorkspaceService
  implements Service<Request, Errors, Response>
{
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async execute({
    userId,
    workspaceId,
  }: Request): Promise<Either<Errors, Response>> {
    const currentUserWorkspace =
      await this.workspaceRepository.findUserByWorkspaceAndUserId(
        workspaceId,
        userId,
      );

    if (!currentUserWorkspace) {
      return left(new UnauthorizedError());
    }

    if (
      currentUserWorkspace.role !== UserRole.OWNER &&
      currentUserWorkspace.role !== UserRole.ADMIN &&
      currentUserWorkspace.role !== UserRole.USER
    ) {
      return left(new UnauthorizedError());
    }

    if (currentUserWorkspace.role === UserRole.OWNER) {
      return left(new CannotRemoveOwnerError());
    }

    // if (currentUserWorkspace.userId === sub) {
    //   return left(
    //     new InvalidWorkspaceUserError(
    //       'Você não pode remover a si mesmo do workspace',
    //     ),
    //   );
    // }

    await this.workspaceRepository.removeUser(currentUserWorkspace.id);

    return right({ success: true });
  }
}
