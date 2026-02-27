import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { WorkspaceUserPresenter } from '@modules/workspace/presenters/WorkspaceUser.presenter';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  AcceptWorkspaceInvitePipe,
  AcceptWorkspaceInviteRequest,
} from './accept-workspace-invite.dto';
import { AcceptWorkspaceInviteHandler } from './accept-workspace-invite.handler';

@ApiTags('Workspace Invite')
@Controller('workspace')
export class AcceptWorkspaceInviteController {
  constructor(private readonly handler: AcceptWorkspaceInviteHandler) {}

  @Post('/invite/accept')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Body(AcceptWorkspaceInvitePipe) body: AcceptWorkspaceInviteRequest,
  ) {
    const data = await this.handler.execute({
      ...body,
      sub,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return WorkspaceUserPresenter.toHTTP(data.value);
  }
}
