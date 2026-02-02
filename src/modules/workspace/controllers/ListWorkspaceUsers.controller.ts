import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { ListWorkspaceUsersDTO } from '../dto/ListWorkspaceUsersDTO';
import { ListWorkspaceUsersGateway } from '../gateways/ListWorkspaceUsers.gateway';
import { WorkspaceUserPresenter } from '../presenters/WorkspaceUser.presenter';
import { ListWorkspaceUsersService } from '../services/ListWorkspaceUsers.service';

@ApiTags('Workspace')
@Controller('workspace')
export class ListWorkspaceUsersController {
  constructor(
    private readonly listWorkspaceUsersService: ListWorkspaceUsersService,
  ) {}

  @Get(':workspaceId/users')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Param('workspaceId') workspaceId: string,
    @Query(ListWorkspaceUsersGateway)
    query: Omit<ListWorkspaceUsersDTO, 'workspaceId'>,
  ) {
    const result = await this.listWorkspaceUsersService.execute({
      ...query,
      workspaceId,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { workspaceUsers, total } = result.value;

    return {
      workspaceUsers: workspaceUsers.map(WorkspaceUserPresenter.toHTTP),
      total,
    };
  }
}
