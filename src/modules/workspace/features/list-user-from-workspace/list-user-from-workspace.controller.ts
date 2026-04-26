import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { WorkspaceUserPresenter } from '@modules/workspace/presenters/WorkspaceUser.presenter';
import { Controller, Get, HttpCode, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  ListWorkspaceUsersPipe,
  type ListWorkspaceUsersRequest,
} from './list-user-from-workspace.dto';
import { ListUsersFromWorkspaceService } from './list-user-from-workspace.service';

@ApiTags('Workspace')
@Controller('workspace')
export class ListUsersFromWorkspaceController {
  constructor(private readonly service: ListUsersFromWorkspaceService) {}

  @Get(':workspaceId/users')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Param('workspaceId') workspaceId: string,
    @Query(ListWorkspaceUsersPipe)
    query: Omit<ListWorkspaceUsersRequest, 'workspaceId'>,
  ) {
    const data = await this.service.execute({
      ...query,
      workspaceId,
      sub,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return {
      workspaceUsers: data.value.workspaceUsers.map(
        WorkspaceUserPresenter.toHTTP,
      ),
      total: data.value.total,
    };
  }
}
