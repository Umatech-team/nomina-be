import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { WorkspaceUserPresenter } from '@modules/workspace/presenters/WorkspaceUser.presenter';
import {
    Body,
    Controller,
    HttpCode,
    Param,
    Put,
    UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { RolesGuard } from '@providers/auth/guards/Roles.guard';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
    UpdateWorkspaceUserPipe,
    type UpdateWorkspaceUserRequest,
} from './update-workspace-user.dto';
import { UpdateWorkspaceUserService } from './update-workspace-user.service';

@ApiTags('Workspace')
@Controller('workspace')
@UseGuards(RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class UpdateWorkspaceUserController {
  constructor(private readonly service: UpdateWorkspaceUserService) {}

  @Put(':workspaceId/users/:workspaceId')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Param('workspaceId')
    { workspaceId }: Pick<UpdateWorkspaceUserRequest, 'workspaceId'>,
    @Body(UpdateWorkspaceUserPipe)
    body: UpdateWorkspaceUserRequest,
  ) {
    const data = await this.service.execute({
      ...body,
      workspaceId,
      sub,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return {
      data: WorkspaceUserPresenter.toHTTP(data.value),
    };
  }
}
