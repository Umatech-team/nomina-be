import { DatabaseModule } from '@infra/databases/Database.module';
import { Module } from '@nestjs/common';
import { SubscriptionModule } from '../subscription/Subscription.module';
import { CreateAccountController } from './controllers/CreateAccount.controller';
import { DeleteAccountController } from './controllers/DeleteAccount.controller';
import { FindAccountController } from './controllers/FindAccount.controller';
import { ListAccountsController } from './controllers/ListAccounts.controller';
import { UpdateAccountController } from './controllers/UpdateAccount.controller';
import { CreateAccountService } from './services/CreateAccount.service';
import { DeleteAccountService } from './services/DeleteAccount.service';
import { FindAccountByIdService } from './services/FindAccountById.service';
import { ListAccountsService } from './services/ListAccounts.service';
import { UpdateAccountService } from './services/UpdateAccount.service';

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
    CreateAccountService,
    UpdateAccountService,
    DeleteAccountService,
    FindAccountByIdService,
    ListAccountsService,
  ],
  exports: [
    CreateAccountService,
    UpdateAccountService,
    DeleteAccountService,
    FindAccountByIdService,
    ListAccountsService,
  ],
})
export class AccountModule {}
