import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { Controller, Delete, HttpCode, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { RolesGuard } from '@providers/auth/guards/Roles.guard';
import { statusCode } from '@shared/core/types/statusCode';
import { type DeleteWorkspaceRequest } from './delete-workspace.dto';
import { DeleteWorkspaceService } from './delete-workspace.service';

@ApiTags('Workspace')
@Controller('workspace')
@UseGuards(RolesGuard)
@Roles(UserRole.OWNER)
export class DeleteWorkspaceController {
  constructor(private readonly service: DeleteWorkspaceService) {}

  @Delete(':workspaceId')
  @HttpCode(statusCode.NO_CONTENT)
  async handle(@Param() { workspaceId }: DeleteWorkspaceRequest) {
    const result = await this.service.execute({
      workspaceId,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }
  }
}
