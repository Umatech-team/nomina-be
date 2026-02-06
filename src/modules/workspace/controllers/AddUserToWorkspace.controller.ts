import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { CreateWorkspaceUserDTO } from '../dto/CreateWorkspaceUserDTO';
import { CreateWorkspaceUserGateway } from '../gateways/CreateWorkspaceUser.gateway';
import { WorkspaceUserPresenter } from '../presenters/WorkspaceUser.presenter';
import { AddUserToWorkspaceService } from '../services/AddUserToWorkspace.service';

@ApiTags('Workspace')
@Controller('workspace')
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class AddUserToWorkspaceController {
  constructor(
    private readonly addUserToWorkspaceService: AddUserToWorkspaceService,
  ) {}

  @Post(':workspaceId/users')
  @HttpCode(statusCode.CREATED)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Param('workspaceId') workspaceId: string,
    @Body(CreateWorkspaceUserGateway)
    body: Omit<CreateWorkspaceUserDTO, 'workspaceId'>,
  ) {
    const result = await this.addUserToWorkspaceService.execute({
      ...body,
      workspaceId,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { workspaceUser } = result.value;

    return WorkspaceUserPresenter.toHTTP(workspaceUser);
  }
}
