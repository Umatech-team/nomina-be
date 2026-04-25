import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { WorkspaceUserPresenter } from '@modules/workspace/presenters/WorkspaceUser.presenter';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
    AcceptWorkspaceInvitePipe,
    type AcceptWorkspaceInviteRequest,
} from './accept-workspace-invite.dto';
import { AcceptWorkspaceInviteService } from './accept-workspace-invite.service';

@ApiTags('Workspace Invite')
@Controller('workspace')
export class AcceptWorkspaceInviteController {
  constructor(private readonly service: AcceptWorkspaceInviteService) {}

  @Post('/invite/accept')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Body(AcceptWorkspaceInvitePipe) body: AcceptWorkspaceInviteRequest,
  ) {
    const data = await this.service.execute({
      ...body,
      sub,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return WorkspaceUserPresenter.toHTTP(data.value);
  }
}
