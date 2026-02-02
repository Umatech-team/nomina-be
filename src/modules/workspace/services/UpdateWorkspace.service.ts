import { UserRole } from '@constants/enums';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { UpdateWorkspaceDTO } from '../dto/UpdateWorkspaceDTO';
import { Workspace } from '../entities/Workspace';
import { InvalidWorkspaceError } from '../errors/InvalidWorkspaceError';
import { WorkspaceNotFoundError } from '../errors/WorkspaceNotFoundError';
import { WorkspaceRepository } from '../repositories/contracts/WorkspaceRepository';

type Request = UpdateWorkspaceDTO & Pick<TokenPayloadSchema, 'sub'>;

type Errors =
  | WorkspaceNotFoundError
  | UnauthorizedError
  | InvalidWorkspaceError;

type Response = { workspace: Workspace };

@Injectable()
export class UpdateWorkspaceService
  implements Service<Request, Errors, Response>
{
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async execute(request: Request): Promise<Either<Errors, Response>> {
    const { workspaceId, sub } = request;
    const name = 'name' in request ? (request.name as string) : undefined;
    const currency =
      'currency' in request ? (request.currency as string) : undefined;

    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      return left(new WorkspaceNotFoundError());
    }

    const workspaceUser =
      await this.workspaceRepository.findUserByWorkspaceAndUserId(
        workspaceId,
        sub,
      );

    if (!workspaceUser) {
      return left(new UnauthorizedError());
    }

    if (
      workspaceUser.role !== UserRole.OWNER &&
      workspaceUser.role !== UserRole.ADMIN
    ) {
      return left(new UnauthorizedError());
    }

    if (name) workspace.name = name;
    if (currency) workspace.currency = currency;

    await this.workspaceRepository.update(workspace);

    return right({ workspace });
  }
}
