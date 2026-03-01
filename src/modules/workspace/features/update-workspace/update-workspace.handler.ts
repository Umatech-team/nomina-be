import { Workspace } from '@modules/workspace/entities/Workspace';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { UpdateWorkspaceRequest } from './update-workspace.dto';

type Request = UpdateWorkspaceRequest & Pick<TokenPayloadSchema, 'workspaceId'>;

type Errors = HttpException;

type Response = Workspace;

@Injectable()
export class UpdateWorkspaceHandler
  implements Service<Request, Errors, Response>
{
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async execute({
    name,
    workspaceId,
    currency = 'BRL',
  }: Request): Promise<Either<Errors, Response>> {
    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      return left(
        new HttpException('Workspace not found', statusCode.NOT_FOUND),
      );
    }

    if (name) workspace.name = name;
    if (currency) workspace.currency = currency;

    await this.workspaceRepository.update(workspace);

    return right(workspace);
  }
}
