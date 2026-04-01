import { DatabaseModule } from '@infra/databases/Database.module';
import { Module } from '@nestjs/common';
import { SubscriptionModule } from '../subscription/Subscription.module';
import { CreateAccountController } from './features/create-account/create-account.controller';
import { CreateAccountHandler } from './features/create-account/create-account.handler';
import { DeleteAccountController } from './features/delete-account/delete-account.controller';
import { DeleteAccountHandler } from './features/delete-account/delete-account.handler';
import { FindAccountController } from './features/find-account/find-account.controller';
import { FindAccountByIdHandler } from './features/find-account/find-account.handler';
import { GetCreditCardInvoiceController } from './features/get-credit-card-invoice/get-credit-card-invoice.controller';
import { GetCreditCardInvoiceHandler } from './features/get-credit-card-invoice/get-credit-card-invoice.handler';
import { ListAccountsController } from './features/list-accounts/list-accounts.controller';
import { ListAccountsHandler } from './features/list-accounts/list-accounts.handler';
import { PayCreditCardInvoiceController } from './features/pay-credit-card-invoice/pay-credit-card-invoice.controller';
import { PayCreditCardInvoiceHandler } from './features/pay-credit-card-invoice/pay-credit-card-invoice.handler';
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
    GetCreditCardInvoiceController,
    PayCreditCardInvoiceController,
  ],
  providers: [
    CreateAccountHandler,
    UpdateAccountHandler,
    DeleteAccountHandler,
    FindAccountByIdHandler,
    ListAccountsHandler,
    GetCreditCardInvoiceHandler,
    PayCreditCardInvoiceHandler,
  ],
  exports: [
    CreateAccountHandler,
    UpdateAccountHandler,
    DeleteAccountHandler,
    FindAccountByIdHandler,
    ListAccountsHandler,
    GetCreditCardInvoiceHandler,
    PayCreditCardInvoiceHandler,
  ],
})
export class AccountModule {}
