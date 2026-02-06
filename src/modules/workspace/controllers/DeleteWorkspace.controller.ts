import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { DeleteWorkspaceService } from '../services/DeleteWorkspace.service';

@ApiTags('Workspace')
@Controller('workspace')
@Roles(UserRole.OWNER)
export class DeleteWorkspaceController {
  constructor(
    private readonly deleteWorkspaceService: DeleteWorkspaceService,
  ) {}

  @Delete(':workspaceId')
  @HttpCode(statusCode.NO_CONTENT)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Param('workspaceId') workspaceId: string,
  ) {
    const result = await this.deleteWorkspaceService.execute({
      workspaceId,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }
  }
}
