import { DatabaseModule } from '@infra/databases/Database.module';
import { Module } from '@nestjs/common';
import { CryptographyModule } from '@providers/cryptography/Cryptography.module';
import { DateModule } from '@providers/date/Date.module';
import { CreateUserController } from './features/create-user/create-user.controller';
import { CreateUserService } from './features/create-user/create-user.service';
import { GetProfileController } from './features/get-profile/get-profile.controller';
import { GetProfileService } from './features/get-profile/get-profile.service';
import { LoginUserController } from './features/login-user/login-user.controller';
import { LoginUserService } from './features/login-user/login-user.service';
import { RefreshTokenController } from './features/refresh-token/refresh-token.controller';
import { RefreshTokenService } from './features/refresh-token/refresh-token.service';

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
    RefreshTokenService,
  ],
})
export class UserModule {}
