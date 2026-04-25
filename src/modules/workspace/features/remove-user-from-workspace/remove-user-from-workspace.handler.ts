import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { RemoveWorkspaceRequest } from './remove-user-from-workspace.dto';

type Request = RemoveWorkspaceRequest & Pick<TokenPayloadSchema, 'workspaceId'>;

type Errors = HttpException;

@Injectable()
export class RemoveUserFromWorkspaceService implements Service<
  Request,
  Errors,
  null
> {
  constructor(
    private readonly workspaceUserRepository: WorkspaceUserRepository,
  ) {}

  async execute({
    userId,
    workspaceId,
  }: Request): Promise<Either<Errors, null>> {
    const currentUserWorkspace =
      await this.workspaceUserRepository.findUserByWorkspaceAndUserId(
        workspaceId,
        userId,
      );

    if (!currentUserWorkspace) {
      return left(
        new HttpException('Usuário não encontrado no workspace', 404),
      );
    }

    await this.workspaceUserRepository.removeUserFromWorkspace(
      currentUserWorkspace.id,
    );

    return right(null);
  }
}
