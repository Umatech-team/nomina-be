import { UserRole } from '@constants/enums';
import { Workspace } from '@modules/workspace/entities/Workspace';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { FindWorkspaceRequest } from './find-workspace.dto';

type Request = FindWorkspaceRequest & Pick<TokenPayloadSchema, 'sub'>;

type Errors = HttpException;

type Response = { workspace: Workspace; role: UserRole };

@Injectable()
export class FindWorkspaceByIdHandler implements Service<
  Request,
  Errors,
  Response
> {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceUserRepository: WorkspaceUserRepository,
  ) {}

  async execute({
    workspaceId,
    sub,
  }: Request): Promise<Either<Errors, Response>> {
    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      return left(
        new HttpException('Workspace not found', statusCode.NOT_FOUND),
      );
    }

    const workspaceUser =
      await this.workspaceUserRepository.findUserByWorkspaceAndUserId(
        workspaceId,
        sub,
      );

    if (!workspaceUser) {
      return left(new HttpException('Unauthorized', statusCode.UNAUTHORIZED));
    }

    return right({
      workspace,
      role: workspaceUser.role,
    });
  }
}
