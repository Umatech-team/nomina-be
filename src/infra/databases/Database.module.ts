import { RefreshTokensRepository } from '@modules/user/repositories/contracts/RefreshTokenRepository';
import { UserRepository } from '@modules/user/repositories/contracts/UserRepository';
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
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
  ],
  exports: [PrismaService, UserRepository, RefreshTokensRepository],
})
export class DatabaseModule {}
