import { SubscriptionStatus } from '@constants/enums';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { Either, left, right } from '@shared/core/errors/Either';
import { getPlanLimits } from '../constants/PlanLimits';
import { SubscriptionRepository } from '../repositories/contracts/SubscriptionRepository';

export enum ResourceType {
  WORKSPACE = 'workspace',
  WORKSPACE_MEMBER = 'workspace_member',
  ACCOUNT = 'account',
  CATEGORY = 'category',
}

interface Request {
  userId: string;
  resourceType: ResourceType;
  workspaceId?: string;
}

type Errors = HttpException;

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
    private readonly workspaceUserRepository: WorkspaceUserRepository,
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
        new HttpException(
          'Subscription is not active. Please renew your plan.',
          403,
        ),
      );
    }

    switch (resourceType) {
      case ResourceType.WORKSPACE:
        return this.checkWorkspaceLimit(userId, limits.maxWorkspaces);

      case ResourceType.WORKSPACE_MEMBER:
        if (!workspaceId) {
          throw new Error(
            'workspaceId required for workspace member limit check',
          );
        }
        return this.checkWorkspaceMemberLimit(
          workspaceId,
          limits.maxMembersPerWorkspace,
        );

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
      maxWorkspaces,
    );
    const currentCount = result.workspaces.length;

    if (currentCount >= maxWorkspaces) {
      return left(
        new HttpException(
          `Workspace limit reached (${currentCount}/${maxWorkspaces}). Upgrade to create more.`,
          403,
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
      maxAccounts,
    );
    const currentCount = result.accounts.length;

    if (currentCount >= maxAccounts) {
      return left(
        new HttpException(
          `Account limit reached (${currentCount}/${maxAccounts}). Upgrade to create more.`,
          403,
        ),
      );
    }

    return right({ allowed: true, currentCount, limit: maxAccounts });
  }

  private async checkWorkspaceMemberLimit(
    workspaceId: string,
    maxMembers: number,
  ): Promise<Either<Errors, Response>> {
    if (maxMembers === -1) {
      return right({ allowed: true, currentCount: 0, limit: -1 });
    }

    const result = await this.workspaceUserRepository.findUsersByWorkspaceId(
      workspaceId,
      1,
      maxMembers,
    );
    const currentCount = result.total;

    if (currentCount >= maxMembers) {
      return left(
        new HttpException(
          `Workspace member limit reached (${currentCount}/${maxMembers}). Upgrade to add more members.`,
          403,
        ),
      );
    }

    return right({ allowed: true, currentCount, limit: maxMembers });
  }
}
