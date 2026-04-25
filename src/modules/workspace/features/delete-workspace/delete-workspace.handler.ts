import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { DeleteWorkspaceRequest } from './delete-workspace.dto';

type Request = DeleteWorkspaceRequest;

type Errors = HttpException;

@Injectable()
export class DeleteWorkspaceService implements Service<Request, Errors, null> {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async execute({ workspaceId }: Request): Promise<Either<Errors, null>> {
    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      return left(
        new HttpException('Workspace not found', statusCode.NOT_FOUND),
      );
    }

    await this.workspaceRepository.delete(workspaceId);

    return right(null);
  }
}
