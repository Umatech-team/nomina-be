import { MemberModule } from '@modules/member/Member.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@providers/auth/Auth.module';
import { CryptographyModule } from '@providers/cryptography/Cryptography.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CryptographyModule,
    MemberModule,
  ],
})
export class AppModule {}
