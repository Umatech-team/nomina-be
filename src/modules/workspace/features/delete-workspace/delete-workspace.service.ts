import { WorkspaceNotFoundError } from '@modules/workspace/errors';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { Injectable } from '@nestjs/common';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { DeleteWorkspaceRequest } from './delete-workspace.dto';

type Request = DeleteWorkspaceRequest;

@Injectable()
export class DeleteWorkspaceService implements Service<Request, Error, void> {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async execute({ workspaceId }: Request): Promise<Either<Error, void>> {
    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      return left(new WorkspaceNotFoundError());
    }

    await this.workspaceRepository.delete(workspaceId);

    return right(undefined);
  }
}
