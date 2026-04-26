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

    console.log('[SubscriptionLimitsGuard] Checking limits', {
      resourceType,
      hasResourceType: !!resourceType,
    });

    if (!resourceType) {
      console.log(
        '[SubscriptionLimitsGuard] No resource type, allowing access',
      );
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('[SubscriptionLimitsGuard] User info', {
      hasUser: !!user,
      userId: user?.sub,
      workspaceId: user?.workspaceId,
    });

    if (!user) {
      console.log('[SubscriptionLimitsGuard] ERROR: User not authenticated');
      throw new ForbiddenException('User not authenticated');
    }

    const result = await this.checkLimitsService.execute({
      userId: user.sub,
      resourceType,
      workspaceId: user.workspaceId,
    });

    if (result.isLeft()) {
      const error = result.value;
      console.log('[SubscriptionLimitsGuard] ERROR: Limit check failed', {
        error: error.message,
      });
      throw new ForbiddenException(error.message);
    }

    console.log('[SubscriptionLimitsGuard] Limit check passed');

    return true;
  }
}
