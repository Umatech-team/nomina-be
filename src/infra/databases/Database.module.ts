import { MemberRepository } from '@modules/member/repositories/contracts/MemberRepository';
import { RefreshTokensRepository } from '@modules/member/repositories/contracts/RefreshTokenRepository';
import { Module } from '@nestjs/common';
import { MemberRepositoryImplementation } from './prisma/member/MemberRepository';
import { RefreshTokensRepositoryImplementation } from './prisma/member/RefreshTokensRepositoryImplementation';
import { PrismaService } from './prisma/prisma.service';

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
  ],
  exports: [PrismaService, MemberRepository, RefreshTokensRepository],
})
export class DatabaseModule {}
