import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { WorkspacePresenter } from '@modules/workspace/presenters/Workspace.presenter';
import {
  Body,
  Controller,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { RolesGuard } from '@providers/auth/guards/Roles.guard';
import { statusCode } from '@shared/core/types/statusCode';
import {
  UpdateWorkspacePipe,
  UpdateWorkspaceRequest,
} from './update-workspace.dto';
import { UpdateWorkspaceHandler } from './update-workspace.handler';

@ApiTags('Workspace')
@Controller('workspace')
@UseGuards(RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class UpdateWorkspaceController {
  constructor(private readonly handler: UpdateWorkspaceHandler) {}

  @Put(':workspaceId')
  @HttpCode(statusCode.OK)
  async handle(
    @Param('workspaceId')
    { workspaceId }: Pick<UpdateWorkspaceRequest, 'workspaceId'>,
    @Body(UpdateWorkspacePipe)
    body: Omit<UpdateWorkspaceRequest, 'workspaceId'>,
  ) {
    const data = await this.handler.execute({
      ...body,
      workspaceId,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return {
      data: WorkspacePresenter.toHTTP(data.value),
    };
  }
}
