import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { WorkspaceUserPresenter } from '@modules/workspace/presenters/WorkspaceUser.presenter';
import { Controller, Get, HttpCode, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  ListWorkspaceUsersPipe,
  ListWorkspaceUsersRequest,
} from './list-user-from-workspace.dto';
import { ListUsersFromWorkspaceHandler } from './list-user-from-workspace.handler';

@ApiTags('Workspace')
@Controller('workspace')
export class ListUsersFromWorkspaceController {
  constructor(private readonly handler: ListUsersFromWorkspaceHandler) {}

  @Get(':workspaceId/users')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Param('workspaceId') workspaceId: string,
    @Query(ListWorkspaceUsersPipe)
    query: Omit<ListWorkspaceUsersRequest, 'workspaceId'>,
  ) {
    const data = await this.handler.execute({
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
