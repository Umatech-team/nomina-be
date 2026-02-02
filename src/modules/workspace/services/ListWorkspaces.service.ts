import { UserRole } from '@constants/enums';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, right } from '@shared/core/errors/Either';
import { ListWorkspacesDTO } from '../dto/ListWorkspacesDTO';
import { Workspace } from '../entities/Workspace';
import { WorkspaceRepository } from '../repositories/contracts/WorkspaceRepository';

type Request = ListWorkspacesDTO & Pick<TokenPayloadSchema, 'sub'>;

type Errors = never;

type Response = {
  workspaces: Array<{
    workspace: Workspace;
    role: UserRole;
    isDefault: boolean;
  }>;
  total: number;
};

@Injectable()
export class ListWorkspacesService
  implements Service<Request, Errors, Response>
{
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async execute({
    page,
    pageSize,
    sub,
  }: Request): Promise<Either<Errors, Response>> {
    const result = await this.workspaceRepository.findManyByUserId(
      sub,
      page,
      pageSize,
    );

    return right({
      workspaces: result.workspaces,
      total: result.total,
    });
  }
}
