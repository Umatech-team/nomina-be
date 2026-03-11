import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { CheckLimit } from '@modules/subscription/decorators/CheckLimit.decorator';
import { SubscriptionLimitsGuard } from '@modules/subscription/guards/SubscriptionLimits.guard';
import { ResourceType } from '@modules/subscription/services/CheckSubscriptionLimits.service';
import { WorkspacePresenter } from '@modules/workspace/presenters/Workspace.presenter';
import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  CreateWorkspacePipe,
  type CreateWorkspaceRequest,
} from './create-workspace.dto';
import { CreateWorkspaceHandler } from './create-workspace.handler';

@ApiTags('Workspace')
@Controller('workspace')
export class CreateWorkspaceController {
  constructor(private readonly handler: CreateWorkspaceHandler) {}

  @Post()
  @HttpCode(statusCode.CREATED)
  @UseGuards(SubscriptionLimitsGuard)
  @CheckLimit(ResourceType.WORKSPACE)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Body(CreateWorkspacePipe) body: CreateWorkspaceRequest,
  ) {
    const data = await this.handler.execute({
      ...body,
      sub,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return {
      data: WorkspacePresenter.toHTTP(data.value.workspace),
    };
  }
}
