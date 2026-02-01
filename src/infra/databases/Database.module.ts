import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { CategoryRepository } from '@modules/category/repositories/contracts/CategoryRepository';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { RefreshTokensRepository } from '@modules/user/repositories/contracts/RefreshTokenRepository';
import { UserRepository } from '@modules/user/repositories/contracts/UserRepository';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { Module } from '@nestjs/common';
import { AccountRepositoryImplementation } from './prisma/account/AccountRepository';
import { CategoryRepositoryImplementation } from './prisma/category/CategoryRepository';
import { PrismaService } from './prisma/prisma.service';
import { TransactionRepositoryImplementation } from './prisma/transaction/TransactionRepository';
import { RefreshTokensRepositoryImplementation } from './prisma/user/RefreshTokensRepositoryImplementation';
import { UserRepositoryImplementation } from './prisma/user/UserRepository';
import { WorkspaceRepositoryImplementation } from './prisma/workspace/WorkspaceRepository';

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
      provide: RefreshTokensRepository,
      useClass: RefreshTokensRepositoryImplementation,
    },
    {
      provide: TransactionRepository,
      useClass: TransactionRepositoryImplementation,
    },
    {
      provide: AccountRepository,
      useClass: AccountRepositoryImplementation,
    },
    {
      provide: CategoryRepository,
      useClass: CategoryRepositoryImplementation,
    },
  ],
  exports: [
    PrismaService,
    UserRepository,
    WorkspaceRepository,
    RefreshTokensRepository,
    TransactionRepository,
    AccountRepository,
    CategoryRepository,
  ],
})
export class DatabaseModule {}
