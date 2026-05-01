import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { type FindWorkspaceRequest } from './find-workspace.dto';
import { FindWorkspaceByIdService } from './find-workspace.service';

@ApiTags('Workspace')
@Controller('workspace')
export class FindWorkspaceController {
  constructor(private readonly service: FindWorkspaceByIdService) {}

  @Get(':workspaceId')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Param('workspaceId') { workspaceId }: FindWorkspaceRequest,
  ) {
    const data = await this.service.execute({
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
