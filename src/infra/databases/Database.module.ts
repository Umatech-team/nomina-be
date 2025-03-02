import { GoalRepository } from '@modules/goal/repositories/contracts/GoalRepository';
import { MemberRepository } from '@modules/member/repositories/contracts/MemberRepository';
import { RefreshTokensRepository } from '@modules/member/repositories/contracts/RefreshTokenRepository';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { Module } from '@nestjs/common';
import { GoalRepositoryImplementation } from './prisma/goal/GoalRepository';
import { MemberRepositoryImplementation } from './prisma/member/MemberRepository';
import { RefreshTokensRepositoryImplementation } from './prisma/member/RefreshTokensRepositoryImplementation';
import { PrismaService } from './prisma/prisma.service';
import { TransactionRepositoryImplementation } from './prisma/transaction/TransactionRepository';

@Module({
  providers: [
    PrismaService,
    {
      provide: MemberRepository,
      useClass: MemberRepositoryImplementation,
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
      provide: GoalRepository,
      useClass: GoalRepositoryImplementation,
    },
  ],
  exports: [
    PrismaService,
    MemberRepository,
    RefreshTokensRepository,
    TransactionRepository,
    GoalRepository,
  ],
})
export class DatabaseModule {}
