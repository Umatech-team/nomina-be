import { UserRole } from '@constants/enums';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { RemoveWorkspaceRequest } from './remove-user-from-workspace.dto';
import { WorkspaceUserNotFoundError } from '@modules/workspace/errors';

type Request = RemoveWorkspaceRequest &
  Pick<TokenPayloadSchema, 'workspaceId'> & { requesterId: string };

@Injectable()
export class RemoveUserFromWorkspaceService implements Service<
  Request,
  Error,
  void
> {
  constructor(
    private readonly workspaceUserRepository: WorkspaceUserRepository,
  ) {}

  async execute({
    userId,
    workspaceId,
    requesterId,
  }: Request): Promise<Either<Error, void>> {
    const requesterMembership =
      await this.workspaceUserRepository.findUserByWorkspaceAndUserId(
        workspaceId,
        requesterId,
      );

    if (!requesterMembership) {
      return left(new UnauthorizedError('Usuário não é membro do workspace.'));
    }

    const canRemove =
      requesterMembership.role === UserRole.OWNER ||
      requesterMembership.role === UserRole.ADMIN;

    if (!canRemove) {
      return left(
        new UnauthorizedError(
          'Apenas proprietários e administradores podem remover membros.',
        ),
      );
    }

    const targetMembership =
      await this.workspaceUserRepository.findUserByWorkspaceAndUserId(
        workspaceId,
        userId,
      );

    if (!targetMembership) {
      return left(new WorkspaceUserNotFoundError());
    }

    await this.workspaceUserRepository.removeUserFromWorkspace(
      targetMembership.id,
    );

    return right(undefined);
  }
}
