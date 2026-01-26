import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { RefreshTokensRepository } from '@modules/user/repositories/contracts/RefreshTokenRepository';
import { UserRepository } from '@modules/user/repositories/contracts/UserRepository';
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { TransactionRepositoryImplementation } from './prisma/transaction/TransactionRepository';
import { RefreshTokensRepositoryImplementation } from './prisma/user/RefreshTokensRepositoryImplementation';
import { UserRepositoryImplementation } from './prisma/user/UserRepository';

@Module({
  providers: [
    PrismaService,
    {
      provide: UserRepository,
      useClass: UserRepositoryImplementation,
    },
    {
      provide: RefreshTokensRepository,
      useClass: RefreshTokensRepositoryImplementation,
    },
    {
      provide: TransactionRepository,
      useClass: TransactionRepositoryImplementation,
    },
  ],
  exports: [
    PrismaService,
    UserRepository,
    RefreshTokensRepository,
    TransactionRepository,
  ],
})
export class DatabaseModule {}
