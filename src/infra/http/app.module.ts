import { GoalModule } from '@modules/goal/Goal.module';
import { MemberModule } from '@modules/member/Member.module';
import { TransactionModule } from '@modules/transaction/Transaction.module';
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
    TransactionModule,
    GoalModule,
  ],
})
export class AppModule {}
