import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { CategoryRepository } from '@modules/category/repositories/contracts/CategoryRepository';
import { SubscriptionRepository } from '@modules/subscription/repositories/contracts/SubscriptionRepository';
import { RecurringTransactionRepository } from '@modules/transaction/repositories/contracts/RecurringTransactionRepository';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { RefreshTokensRepository } from '@modules/user/repositories/contracts/RefreshTokenRepository';
import { UserRepository } from '@modules/user/repositories/contracts/UserRepository';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { Module } from '@nestjs/common';
import { AccountRepositoryImplementation } from './prisma/account/AccountRepository';
import { CategoryRepositoryImplementation } from './prisma/category/CategoryRepository';
import { PrismaService } from './prisma/prisma.service';
import { SubscriptionRepositoryImplementation } from './prisma/subscription/SubscriptionRepositoryImplementation';
import { RecurringTransactionRepositoryImplementation } from './prisma/transaction/RecurringTransactionRepositoryImplementation';
import { TransactionRepositoryImplementation } from './prisma/transaction/TransactionRepository';
import { RefreshTokensRepositoryImplementation } from './prisma/user/RefreshTokensRepositoryImplementation';
import { UserRepositoryImplementation } from './prisma/user/UserRepository';
import { WorkspaceRepositoryImplementation } from './prisma/workspace/WorkspaceRepository';
import { WorkspaceUserRepositoryImplementation } from './prisma/workspace/WorkspaceUserRepository';

@Module({
  providers: [
    PrismaService,
    {
      provide: UserRepository,
      useClass: UserRepositoryImplementation,
    },
    {
      provide: WorkspaceRepository,
      useClass: WorkspaceRepositoryImplementation,
    },
    {
      provide: WorkspaceUserRepository,
      useClass: WorkspaceUserRepositoryImplementation,
    },
    {
      provide: RefreshTokensRepository,
      useClass: RefreshTokensRepositoryImplementation,
    },
    {
      provide: TransactionRepository,
      useClass: TransactionRepositoryImplementation,
    },
    {
      provide: RecurringTransactionRepository,
      useClass: RecurringTransactionRepositoryImplementation,
    },
    {
      provide: AccountRepository,
      useClass: AccountRepositoryImplementation,
    },
    {
      provide: CategoryRepository,
      useClass: CategoryRepositoryImplementation,
    },
    {
      provide: SubscriptionRepository,
      useClass: SubscriptionRepositoryImplementation,
    },
  ],
  exports: [
    PrismaService,
    UserRepository,
    WorkspaceRepository,
    WorkspaceUserRepository,
    RefreshTokensRepository,
    TransactionRepository,
    RecurringTransactionRepository,
    AccountRepository,
    CategoryRepository,
    SubscriptionRepository,
  ],
})
export class DatabaseModule {}
