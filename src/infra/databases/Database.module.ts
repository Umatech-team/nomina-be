import { RefreshTokensRepository } from '@modules/member/repositories/contracts/RefreshTokenRepository';
import { UserRepository } from '@modules/member/repositories/contracts/UserRepository';
import { Module } from '@nestjs/common';
import { RefreshTokensRepositoryImplementation } from './prisma/member/RefreshTokensRepositoryImplementation';
import { UserRepositoryImplementation } from './prisma/member/UserRepository';
import { PrismaService } from './prisma/prisma.service';

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
  ],
  exports: [PrismaService, UserRepository, RefreshTokensRepository],
})
export class DatabaseModule {}
