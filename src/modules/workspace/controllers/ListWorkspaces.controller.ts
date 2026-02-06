import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { ListWorkspacesDTO } from '../dto/ListWorkspacesDTO';
import { ListWorkspacesGateway } from '../gateways/ListWorkspaces.gateway';
import { WorkspacePresenter } from '../presenters/Workspace.presenter';
import { ListWorkspacesService } from '../services/ListWorkspaces.service';

@ApiTags('Workspace')
@Controller('workspace')
export class ListWorkspacesController {
  constructor(private readonly listWorkspacesService: ListWorkspacesService) {}

  @Get()
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Query(ListWorkspacesGateway) query: ListWorkspacesDTO,
  ) {
    const result = await this.listWorkspacesService.execute({
      ...query,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { workspaces, total } = result.value;

    return {
      workspaces: workspaces.map(({ workspace, role, isDefault }) => ({
        ...WorkspacePresenter.toHTTP(workspace),
        role,
        isDefault,
      })),
      total,
    };
  }
}
