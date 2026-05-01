import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { Controller, HttpCode, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { type SetDefaultWorkspaceRequest } from './set-default-workspace.dto';
import { SetDefaultWorkspaceService } from './set-default-workspace.service';

@ApiTags('Workspace')
@Controller('workspace')
export class SetDefaultWorkspaceController {
  constructor(private readonly service: SetDefaultWorkspaceService) {}

  @Patch(':workspaceId/default')
  @HttpCode(statusCode.NO_CONTENT)
  async handle(
    @Param() { workspaceId }: SetDefaultWorkspaceRequest,
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
  ) {
    const result = await this.service.execute({ workspaceId, sub });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }
  }
}
