import { DatabaseModule } from '@infra/databases/Database.module';
import { Module } from '@nestjs/common';
import { CryptographyModule } from '@providers/cryptography/Cryptography.module';
import { DateModule } from '@providers/date/Date.module';
import { CreateUserController } from './features/create-user/create-user.controller';
import { CreateUserHandler } from './features/create-user/create-user.handler';
import { GetProfileController } from './features/get-profile/get-profile.controller';
import { GetProfileHandler } from './features/get-profile/get-profile.handler';
import { LoginUserController } from './features/login-user/login-user.controller';
import { LoginUserHandler } from './features/login-user/login-user.handler';
import { RefreshTokenController } from './features/refresh-token/refresh-token.controller';
import { RefreshTokenHandler } from './features/refresh-token/refresh-token.handler';

@Module({
  controllers: [
    CreateUserController,
    GetProfileController,
    LoginUserController,
    RefreshTokenController,
  ],
  imports: [DatabaseModule, CryptographyModule, DateModule],
  providers: [
    CreateUserHandler,
    GetProfileHandler,
    LoginUserHandler,
    RefreshTokenHandler,
  ],
})
export class UserModule {}
