import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { Injectable } from '@nestjs/common';
import { SubscriptionStatus } from '@prisma/client';
import { Either, left, right } from '@shared/core/errors/Either';
import { getPlanLimits } from '../constants/PlanLimits';
import { SubscriptionLimitExceededError } from '../errors/SubscriptionLimitExceededError';
import { SubscriptionRepository } from '../repositories/contracts/SubscriptionRepository';

export enum ResourceType {
  WORKSPACE = 'workspace',
  ACCOUNT = 'account',
  CATEGORY = 'category',
}

interface Request {
  userId: string;
  resourceType: ResourceType;
  workspaceId?: string; // Para limites por workspace (ex: accounts)
}

type Errors = SubscriptionLimitExceededError;

interface Response {
  allowed: boolean;
  currentCount: number;
  limit: number;
}

@Injectable()
export class CheckSubscriptionLimitsService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly accountRepository: AccountRepository,
  ) {}

  async execute({
    userId,
    resourceType,
    workspaceId,
  }: Request): Promise<Either<Errors, Response>> {
    const subscription = await this.subscriptionRepository.findByUserId(userId);

    const planId = subscription?.planId ?? 'plan_free';
    const limits = getPlanLimits(planId);

    if (subscription && subscription.status !== SubscriptionStatus.ACTIVE) {
      return left(
        new SubscriptionLimitExceededError(
          'Subscription is not active. Please renew your plan.',
        ),
      );
    }

    switch (resourceType) {
      case ResourceType.WORKSPACE:
        return this.checkWorkspaceLimit(userId, limits.maxWorkspaces);

      case ResourceType.ACCOUNT:
        if (!workspaceId) {
          throw new Error('workspaceId required for account limit check');
        }
        return this.checkAccountLimit(
          workspaceId,
          limits.maxAccountsPerWorkspace,
        );

      case ResourceType.CATEGORY:
        return right({
          allowed: true,
          currentCount: 0,
          limit: limits.maxCategories,
        });

      default:
        return right({ allowed: true, currentCount: 0, limit: -1 });
    }
  }

  private async checkWorkspaceLimit(
    userId: string,
    maxWorkspaces: number,
  ): Promise<Either<Errors, Response>> {
    if (maxWorkspaces === -1) {
      return right({ allowed: true, currentCount: 0, limit: -1 });
    }

    const result = await this.workspaceRepository.findManyByUserId(
      userId,
      1,
      1000,
    );
    const currentCount = result.workspaces.length;

    if (currentCount >= maxWorkspaces) {
      return left(
        new SubscriptionLimitExceededError(
          `Workspace limit reached (${currentCount}/${maxWorkspaces}). Upgrade to create more.`,
        ),
      );
    }

    return right({ allowed: true, currentCount, limit: maxWorkspaces });
  }

  private async checkAccountLimit(
    workspaceId: string,
    maxAccounts: number,
  ): Promise<Either<Errors, Response>> {
    if (maxAccounts === -1) {
      return right({ allowed: true, currentCount: 0, limit: -1 });
    }

    const result = await this.accountRepository.findManyByWorkspaceId(
      workspaceId,
      1,
      1000,
    );
    const currentCount = result.accounts.length;

    if (currentCount >= maxAccounts) {
      return left(
        new SubscriptionLimitExceededError(
          `Account limit reached (${currentCount}/${maxAccounts}). Upgrade to create more.`,
        ),
      );
    }

    return right({ allowed: true, currentCount, limit: maxAccounts });
  }
}
