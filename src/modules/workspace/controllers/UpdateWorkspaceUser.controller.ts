import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, HttpCode, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { UpdateWorkspaceUserDTO } from '../dto/UpdateWorkspaceUserDTO';
import { UpdateWorkspaceUserGateway } from '../gateways/UpdateWorkspaceUser.gateway';
import { WorkspaceUserPresenter } from '../presenters/WorkspaceUser.presenter';
import { UpdateWorkspaceUserService } from '../services/UpdateWorkspaceUser.service';

@ApiTags('Workspace')
@Controller('workspace')
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class UpdateWorkspaceUserController {
  constructor(
    private readonly updateWorkspaceUserService: UpdateWorkspaceUserService,
  ) {}

  @Put(':workspaceId/users/:workspaceUserId')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Param('workspaceUserId') workspaceUserId: string,
    @Body(UpdateWorkspaceUserGateway)
    body: Omit<UpdateWorkspaceUserDTO, 'workspaceUserId'>,
  ) {
    const result = await this.updateWorkspaceUserService.execute({
      ...body,
      workspaceUserId,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { workspaceUser } = result.value;

    return WorkspaceUserPresenter.toHTTP(workspaceUser);
  }
}
