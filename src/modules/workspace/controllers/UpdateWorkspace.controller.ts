import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, HttpCode, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { UpdateWorkspaceDTO } from '../dto/UpdateWorkspaceDTO';
import { UpdateWorkspaceGateway } from '../gateways/UpdateWorkspace.gateway';
import { WorkspacePresenter } from '../presenters/Workspace.presenter';
import { UpdateWorkspaceService } from '../services/UpdateWorkspace.service';

@ApiTags('Workspace')
@Controller('workspace')
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class UpdateWorkspaceController {
  constructor(
    private readonly updateWorkspaceService: UpdateWorkspaceService,
  ) {}

  @Put(':workspaceId')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Param('workspaceId') workspaceId: string,
    @Body(UpdateWorkspaceGateway) body: Omit<UpdateWorkspaceDTO, 'workspaceId'>,
  ) {
    const result = await this.updateWorkspaceService.execute({
      ...body,
      workspaceId,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { workspace } = result.value;

    return WorkspacePresenter.toHTTP(workspace);
  }
}
