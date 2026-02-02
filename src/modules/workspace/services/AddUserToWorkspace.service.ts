import { UserRole } from '@constants/enums';
import { UserNotFoundError } from '@modules/user/errors/UserNotFoundError';
import { UserRepository } from '@modules/user/repositories/contracts/UserRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { CreateWorkspaceUserDTO } from '../dto/CreateWorkspaceUserDTO';
import { WorkspaceUser } from '../entities/WorkspaceUser';
import { ConflictWorkspaceUserError } from '../errors/ConflictWorkspaceUserError';
import { InvalidWorkspaceUserError } from '../errors/InvalidWorkspaceUserError';
import { WorkspaceNotFoundError } from '../errors/WorkspaceNotFoundError';
import { WorkspaceRepository } from '../repositories/contracts/WorkspaceRepository';

type Request = CreateWorkspaceUserDTO & Pick<TokenPayloadSchema, 'sub'>;

type Errors =
  | WorkspaceNotFoundError
  | UnauthorizedError
  | UserNotFoundError
  | ConflictWorkspaceUserError
  | InvalidWorkspaceUserError;

type Response = { workspaceUser: WorkspaceUser };

@Injectable()
export class AddUserToWorkspaceService
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({
    workspaceId,
    userId,
    role,
    sub,
  }: Request): Promise<Either<Errors, Response>> {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      return left(new WorkspaceNotFoundError());
    }

    const currentUserWorkspace =
      await this.workspaceRepository.findUserByWorkspaceAndUserId(
        workspaceId,
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

    if (role === UserRole.OWNER) {
      return left(
        new InvalidWorkspaceUserError(
          'Não é possível adicionar outro proprietário ao workspace',
        ),
      );
    }

    const targetUser = await this.userRepository.findUniqueById(userId);
    if (!targetUser) {
      return left(new UserNotFoundError());
    }

    const existingWorkspaceUser =
      await this.workspaceRepository.findUserByWorkspaceAndUserId(
        workspaceId,
        userId,
      );

    if (existingWorkspaceUser) {
      return left(new ConflictWorkspaceUserError());
    }

    const workspaceUserOrError = WorkspaceUser.create({
      workspaceId,
      userId,
      role,
      isDefault: false,
      joinedAt: new Date(),
    });

    if (workspaceUserOrError.isLeft()) {
      return left(workspaceUserOrError.value);
    }

    const workspaceUser = workspaceUserOrError.value;

    await this.workspaceRepository.addUser(workspaceUser);

    return right({ workspaceUser });
  }
}
