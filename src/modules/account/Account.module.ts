import { DatabaseModule } from '@infra/databases/Database.module';
import { Module } from '@nestjs/common';
import { SubscriptionModule } from '../subscription/Subscription.module';
import { CreateAccountController } from './features/create-account/create-account.controller';
import { CreateAccountHandler } from './features/create-account/create-account.handler';
import { DeleteAccountController } from './features/delete-account/delete-account.controller';
import { DeleteAccountHandler } from './features/delete-account/delete-account.handler';
import { FindAccountController } from './features/find-account/find-account.controller';
import { FindAccountByIdHandler } from './features/find-account/find-account.handler';
import { ListAccountsController } from './features/list-accounts/list-accounts.controller';
import { ListAccountsHandler } from './features/list-accounts/list-accounts.handler';
import { UpdateAccountController } from './features/update-account/update-account.controller';
import { UpdateAccountHandler } from './features/update-account/update-account.handler';
@Module({
  imports: [DatabaseModule, SubscriptionModule],
  controllers: [
    CreateAccountController,
    UpdateAccountController,
    DeleteAccountController,
    FindAccountController,
    ListAccountsController,
  ],
  providers: [
    CreateAccountHandler,
    UpdateAccountHandler,
    DeleteAccountHandler,
    FindAccountByIdHandler,
    ListAccountsHandler,
  ],
  exports: [
    CreateAccountHandler,
    UpdateAccountHandler,
    DeleteAccountHandler,
    FindAccountByIdHandler,
    ListAccountsHandler,
  ],
})
export class AccountModule {}
