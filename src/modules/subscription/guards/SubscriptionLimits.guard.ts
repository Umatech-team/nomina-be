import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  CheckSubscriptionLimitsService,
  ResourceType,
} from '../services/CheckSubscriptionLimits.service';

export const RESOURCE_TYPE_KEY = 'resourceType';

@Injectable()
export class SubscriptionLimitsGuard implements CanActivate {
  constructor(
    private readonly checkLimitsService: CheckSubscriptionLimitsService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resourceType = this.reflector.get<ResourceType>(
      RESOURCE_TYPE_KEY,
      context.getHandler(),
    );

    if (!resourceType) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const result = await this.checkLimitsService.execute({
      userId: user.sub,
      resourceType,
      workspaceId: user.workspaceId,
    });

    if (result.isLeft()) {
      const error = result.value;
      throw new ForbiddenException(error.message);
    }

    return true;
  }
}
