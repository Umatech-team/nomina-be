import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { FindWorkspaceRequest } from './find-workspace.dto';
import { FindWorkspaceByIdHandler } from './find-workspace.handler';

@ApiTags('Workspace')
@Controller('workspace')
export class FindWorkspaceController {
  constructor(private readonly handler: FindWorkspaceByIdHandler) {}

  @Get(':workspaceId')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Param('workspaceId') { workspaceId }: FindWorkspaceRequest,
  ) {
    const data = await this.handler.execute({
      workspaceId,
      sub,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return {
      data: {
        workspace: data.value.workspace,
        role: data.value.role,
      },
    };
  }
}
