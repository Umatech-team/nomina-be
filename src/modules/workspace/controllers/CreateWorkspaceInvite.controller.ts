import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import {
  CheckLimit,
  ResourceType,
  SubscriptionLimitsGuard,
} from '@modules/subscription';
import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { CreateWorkspaceInviteDTO } from '../dto/CreateWorkspaceInviteDTO';
import { CreateWorkspaceInviteGateway } from '../gateways/CreateWorkspaceInvite.gateway';
import { WorkspaceInvitePresenter } from '../presenters/WorkspaceInvite.presenter';
import { CreateWorkspaceInviteService } from '../services/CreateWorkspaceInvite.service';

@ApiTags('Workspace Invite')
@Controller('workspace')
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class CreateWorkspaceInviteController {
  constructor(
    private readonly createWorkspaceInviteService: CreateWorkspaceInviteService,
  ) {}

  @Post('/invite')
  @HttpCode(statusCode.CREATED)
  @UseGuards(SubscriptionLimitsGuard)
  @CheckLimit(ResourceType.WORKSPACE_MEMBER)
  async handle(
    @CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema,
    @Body(CreateWorkspaceInviteGateway) body: CreateWorkspaceInviteDTO,
  ) {
    const result = await this.createWorkspaceInviteService.execute({
      role: body.role as UserRole,
      sub,
      workspaceId,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { workspaceInvite } = result.value;

    return WorkspaceInvitePresenter.toHTTP(workspaceInvite);
  }
}
