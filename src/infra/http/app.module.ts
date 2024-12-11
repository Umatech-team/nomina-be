import { UserModule } from '@modules/user/User.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@providers/auth/Auth.module';
import { CryptographyModule } from '@providers/cryptography/Cryptography.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CryptographyModule,
    UserModule,
  ],
})
export class AppModule {}
