import { DatabaseModule } from '@infra/databases/Database.module';
import { Module } from '@nestjs/common';
import { CryptographyModule } from '@providers/cryptography/Cryptography.module';
import { DateModule } from '@providers/date/Date.module';
import { CreateMemberController } from './controllers/CreateMember.controller';
import { GetMemberController } from './controllers/GetMember.controller';
import { LoginMemberController } from './controllers/LoginMember.controller';
import { RefreshTokenController } from './controllers/RefreshToken.controller';
import { CreateMemberService } from './services/CreateMember.service';
import { FindMemberByIdService } from './services/FindMemberById.service';
import { LoginMemberService } from './services/LoginMember.service';
import { RefreshTokenService } from './services/RefreshToken.service';

@Module({
  controllers: [
    CreateMemberController,
    LoginMemberController,
    GetMemberController,
    RefreshTokenController,
  ],
  imports: [DatabaseModule, CryptographyModule, DateModule],
  providers: [
    CreateMemberService,
    FindMemberByIdService,
    LoginMemberService,
    RefreshTokenService,
  ],
})
export class MemberModule {}
