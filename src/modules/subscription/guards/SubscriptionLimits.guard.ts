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

// Metadata key para decorator
export const RESOURCE_TYPE_KEY = 'resourceType';

@Injectable()
export class SubscriptionLimitsGuard implements CanActivate {
  constructor(
    private readonly checkLimitsService: CheckSubscriptionLimitsService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Obter tipo de recurso dos metadados
    const resourceType = this.reflector.get<ResourceType>(
      RESOURCE_TYPE_KEY,
      context.getHandler(),
    );

    if (!resourceType) {
      return true; // Sem metadata, permitir
    }

    // 2. Extrair dados da requisição
    const request = context.switchToHttp().getRequest();
    const user = request.user; // JWT payload

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // 3. Verificar limite
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
