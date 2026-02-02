import { AccountModule } from '@modules/account/Account.module';
import { CategoryModule } from '@modules/category/Category.module';
import { ReportModule } from '@modules/report/Report.module';
import { SubscriptionModule } from '@modules/subscription/Subscription.module';
import { TransactionModule } from '@modules/transaction/Transaction.module';
import { UserModule } from '@modules/user/User.module';
import { WorkspaceModule } from '@modules/workspace/Workspace.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@providers/auth/Auth.module';
import { JwtAuthGuard } from '@providers/auth/guards/jwtAuth.guard';
import { RolesGuard } from '@providers/auth/guards/Roles.guard';
import { CryptographyModule } from '@providers/cryptography/Cryptography.module';
import { DateModule } from '@providers/date/Date.module';
import { RedisModule } from '../cache/Redis.module';
import { DatabaseModule } from '../databases/Database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    RedisModule,
    AuthModule,
    CryptographyModule,
    DateModule,
    UserModule,
    WorkspaceModule,
    TransactionModule,
    AccountModule,
    CategoryModule,
    ReportModule,
    SubscriptionModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
