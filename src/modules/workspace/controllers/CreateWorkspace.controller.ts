import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { CheckLimit } from '@modules/subscription/decorators/CheckLimit.decorator';
import { SubscriptionLimitsGuard } from '@modules/subscription/guards/SubscriptionLimits.guard';
import { ResourceType } from '@modules/subscription/services/CheckSubscriptionLimits.service';
import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { CreateWorkspaceDTO } from '../dto/CreateWorkspaceDTO';
import { CreateWorkspaceGateway } from '../gateways/CreateWorkspace.gateway';
import { WorkspacePresenter } from '../presenters/Workspace.presenter';
import { CreateWorkspaceService } from '../services/CreateWorkspace.service';

@ApiTags('Workspace')
@Controller('workspace')
export class CreateWorkspaceController {
  constructor(
    private readonly createWorkspaceService: CreateWorkspaceService,
  ) {}

  @Post()
  @HttpCode(statusCode.CREATED)
  @UseGuards(SubscriptionLimitsGuard)
  @CheckLimit(ResourceType.WORKSPACE)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Body(CreateWorkspaceGateway) body: CreateWorkspaceDTO,
  ) {
    const result = await this.createWorkspaceService.execute({
      ...body,
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { workspace } = result.value;

    return WorkspacePresenter.toHTTP(workspace);
  }
}
