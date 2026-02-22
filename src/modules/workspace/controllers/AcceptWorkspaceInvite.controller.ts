import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { AcceptWorkspaceInviteDTO } from '../dto/AcceptWorkspaceInviteDTO';
import { AcceptWorkspaceInviteGateway } from '../gateways/AcceptWorkspaceInvite.gateway';
import { WorkspaceUserPresenter } from '../presenters/WorkspaceUser.presenter';
import { AcceptWorkspaceInviteService } from '../services/AcceptWorkspaceInvite.service';

@ApiTags('Workspace Invite')
@Controller('workspace')
export class AcceptWorkspaceInviteController {
  constructor(
    private readonly acceptWorkspaceInviteService: AcceptWorkspaceInviteService,
  ) {}

  @Post('/invite/accept')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Body(AcceptWorkspaceInviteGateway) body: AcceptWorkspaceInviteDTO,
  ) {
    const result = await this.acceptWorkspaceInviteService.execute({
      ...body,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { workspaceUser } = result.value;

    return WorkspaceUserPresenter.toHTTP(workspaceUser);
  }
}
