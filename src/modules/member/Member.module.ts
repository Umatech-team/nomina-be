import { DatabaseModule } from '@infra/databases/Database.module';
import { Module } from '@nestjs/common';
import { CryptographyModule } from '@providers/cryptography/Cryptography.module';
import { DateModule } from '@providers/date/Date.module';
import { CreateMemberController } from './controllers/CreateMember.controller';
import { GetMemberController } from './controllers/GetMember.controller';
import { LoginMemberController } from './controllers/LoginMember.controller';
import { RefreshTokenController } from './controllers/RefreshToken.controller';
import { UpdateMemberGeneralInfosController } from './controllers/UpdateMemberGeneralInfos';
import { UpdateMemberPasswordController } from './controllers/UpdateMemberPassword';
import { CreateMemberService } from './services/CreateMember.service';
import { FindMemberByIdService } from './services/FindMemberById.service';
import { LoginMemberService } from './services/LoginMember.service';
import { RefreshTokenService } from './services/RefreshToken.service';
import { UpdateMemberGeneralInfosService } from './services/UpdateMember.service';
import { UpdateMemberPasswordService } from './services/UpdateMemberPassword.service';

@Module({
  controllers: [
    CreateMemberController,
    LoginMemberController,
    GetMemberController,
    UpdateMemberGeneralInfosController,
    UpdateMemberPasswordController,
    RefreshTokenController,
  ],
  imports: [DatabaseModule, CryptographyModule, DateModule],
  providers: [
    CreateMemberService,
    FindMemberByIdService,
    LoginMemberService,
    UpdateMemberGeneralInfosService,
    UpdateMemberPasswordService,
    RefreshTokenService,
  ],
})
export class MemberModule {}
