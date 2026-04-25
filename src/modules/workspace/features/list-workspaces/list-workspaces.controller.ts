import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { WorkspacePresenter } from '@modules/workspace/presenters/Workspace.presenter';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
    ListWorkspacesPipe,
    type ListWorkspacesRequest,
} from './list-workspaces.dto';
import { ListWorkspacesService } from './list-workspaces.service';

@ApiTags('Workspace')
@Controller('workspace')
export class ListWorkspacesController {
  constructor(private readonly service: ListWorkspacesService) {}

  @Get()
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Query(ListWorkspacesPipe) query: ListWorkspacesRequest,
  ) {
    const data = await this.service.execute({
      ...query,
      sub,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return {
      data: {
        workspaces: data.value.workspaces.map(
          ({ workspace, role, isDefault }) => ({
            ...WorkspacePresenter.toHTTP(workspace),
            role,
            isDefault,
          }),
        ),
        total: data.value.total,
      },
    };
  }
}
