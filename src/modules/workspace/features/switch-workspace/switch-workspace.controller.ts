import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, HttpCode, Patch } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  SwitchWorkspacePipe,
  SwitchWorkspaceRequest,
} from './switch-workspace.dto';
import { SwitchWorkspaceHandler } from './switch-workspace.handler';

@ApiTags('Workspace')
@Controller('workspace')
export class SwitchWorkspaceController {
  constructor(private readonly handler: SwitchWorkspaceHandler) {}

  @Patch('switch')
  @HttpCode(statusCode.OK)
  @ApiOperation({
    summary: 'Trocar de workspace ativo',
    description:
      'Gera um novo par de tokens JWT (access + refresh) com o workspaceId atualizado, permitindo alternar entre workspaces sem fazer login novamente.',
  })
  @ApiResponse({
    status: statusCode.OK,
    description: 'Tokens gerados com sucesso',
  })
  @ApiResponse({
    status: statusCode.NOT_FOUND,
    description: 'Workspace não encontrado',
  })
  @ApiResponse({
    status: statusCode.FORBIDDEN,
    description: 'Usuário não tem acesso ao workspace',
  })
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Body(SwitchWorkspacePipe) body: SwitchWorkspaceRequest,
  ) {
    const data = await this.handler.execute({
      ...body,
      sub,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return {
      data: data.value,
    };
  }
}
