import { DatabaseModule } from '@infra/databases/Database.module';
import { Module } from '@nestjs/common';
import { CryptographyModule } from '@providers/cryptography/Cryptography.module';
import { DateModule } from '@providers/date/Date.module';
import { CreateUserController } from './controllers/CreateUser.controller';
import { LoginUserController } from './controllers/LoginUser.controller';
import { RefreshTokenController } from './controllers/RefreshToken.controller';
import { CreateUserService } from './services/CreateUser.service';
import { LoginUserService } from './services/LoginUser.service';
import { RefreshTokenService } from './services/RefreshToken.service';
import { UpdateUserGeneralInfosService } from './services/UpdateMember.service';
import { UpdateUserPasswordService } from './services/UpdateMemberPassword.service';

@Module({
  controllers: [
    CreateUserController,
    LoginUserController,
    RefreshTokenController,
  ],
  imports: [DatabaseModule, CryptographyModule, DateModule],
  providers: [
    CreateUserService,
    LoginUserService,
    UpdateUserGeneralInfosService,
    UpdateUserPasswordService,
    RefreshTokenService,
  ],
})
export class UserModule {}
