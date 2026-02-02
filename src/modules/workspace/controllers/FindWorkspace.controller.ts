import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { WorkspacePresenter } from '../presenters/Workspace.presenter';
import { FindWorkspaceByIdService } from '../services/FindWorkspaceById.service';

@ApiTags('Workspace')
@Controller('workspace')
export class FindWorkspaceController {
  constructor(
    private readonly findWorkspaceByIdService: FindWorkspaceByIdService,
  ) {}

  @Get(':workspaceId')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Param('workspaceId') workspaceId: string,
  ) {
    const result = await this.findWorkspaceByIdService.execute({
      workspaceId,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { workspace, role } = result.value;

    return {
      ...WorkspacePresenter.toHTTP(workspace),
      role,
    };
  }
}
