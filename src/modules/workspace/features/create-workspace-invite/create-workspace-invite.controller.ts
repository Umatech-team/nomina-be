import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import {
  CheckLimit,
  ResourceType,
  SubscriptionLimitsGuard,
} from '@modules/subscription';
import { WorkspaceInvitePresenter } from '@modules/workspace/presenters/WorkspaceInvite.presenter';
import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { RolesGuard } from '@providers/auth/guards/Roles.guard';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  CreateWorkspaceInvitePipe,
  CreateWorkspaceInviteRequest,
} from './create-workspace-invite.dto';
import { CreateWorkspaceInviteHandler } from './create-workspace-invite.handler';

@ApiTags('Workspace Invite')
@Controller('workspace')
@UseGuards(RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class CreateWorkspaceInviteController {
  constructor(private readonly handler: CreateWorkspaceInviteHandler) {}

  @Post('/invite')
  @HttpCode(statusCode.CREATED)
  @UseGuards(SubscriptionLimitsGuard)
  @CheckLimit(ResourceType.WORKSPACE_MEMBER)
  async handle(
    @CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema,
    @Body(CreateWorkspaceInvitePipe) body: CreateWorkspaceInviteRequest,
  ) {
    const data = await this.handler.execute({
      role: body.role as UserRole,
      sub,
      workspaceId,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return {
      data: WorkspaceInvitePresenter.toHTTP(data.value),
    };
  }
}
