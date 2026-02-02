import { DatabaseModule } from '@infra/databases/Database.module';
import { Module } from '@nestjs/common';
import { CryptographyModule } from '@providers/cryptography/Cryptography.module';
import { DateModule } from '@providers/date/Date.module';
import { CreateUserController } from './controllers/CreateUser.controller';
import { GetProfileController } from './controllers/GetProfile.controller';
import { LoginUserController } from './controllers/LoginUser.controller';
import { RefreshTokenController } from './controllers/RefreshToken.controller';
import { CreateUserService } from './services/CreateUser.service';
import { GetProfileService } from './services/GetProfile.service';
import { LoginUserService } from './services/LoginUser.service';
import { RefreshTokenService } from './services/RefreshToken.service';
import { UpdateUserGeneralInfosService } from './services/UpdateMember.service';
import { UpdateUserPasswordService } from './services/UpdateMemberPassword.service';

@Module({
  controllers: [
    CreateUserController,
    GetProfileController,
    LoginUserController,
    RefreshTokenController,
  ],
  imports: [DatabaseModule, CryptographyModule, DateModule],
  providers: [
    CreateUserService,
    GetProfileService,
    LoginUserService,
    UpdateUserGeneralInfosService,
    UpdateUserPasswordService,
    RefreshTokenService,
  ],
})
export class UserModule {}
