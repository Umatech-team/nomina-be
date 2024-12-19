import { DatabaseModule } from '@infra/databases/Database.module';
import { Module } from '@nestjs/common';
import { CryptographyModule } from '@providers/cryptography/Cryptography.module';
import { DateModule } from '@providers/date/Date.module';
import { CreateUserController } from './controllers/CreateUser.controller';
import { GetUserController } from './controllers/GetUser.controller';
import { LoginUserController } from './controllers/LoginUser.controller';
import { RefreshTokenController } from './controllers/RefreshToken.controller';
import { CreateUserService } from './services/CreateUser.service';
import { FindUserByIdService } from './services/FindUserById.service';
import { LoginUserService } from './services/LoginUser.service';
import { RefreshTokenService } from './services/RefreshToken.service';

@Module({
  controllers: [
    CreateUserController,
    LoginUserController,
    GetUserController,
    RefreshTokenController,
  ],
  imports: [DatabaseModule, CryptographyModule, DateModule],
  providers: [
    CreateUserService,
    FindUserByIdService,
    LoginUserService,
    RefreshTokenService,
  ],
})
export class UserModule {}
