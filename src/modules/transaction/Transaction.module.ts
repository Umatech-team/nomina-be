import { DatabaseModule } from '@infra/databases/Database.module';
import { FindMonthSummaryController } from '@modules/report/features/get-month-summary/get-month-summary.controller';
import { FindMonthSummaryHandler } from '@modules/report/features/get-month-summary/get-month-summary.handler';
import { UserModule } from '@modules/user/User.module';
import { Module } from '@nestjs/common';
import { CreateRecurringTransactionController } from './features/create-recurring-transaction/create-recurring-transaction.controller';
import { CreateRecurringTransactionHandler } from './features/create-recurring-transaction/create-recurring-transaction.handle';
import { CreateTransactionController } from './features/create-transaction/create-transaction.controller';
import { CreateTransactionHandler } from './features/create-transaction/create-transaction.handle';
import { DeleteRecurringTransactionController } from './features/delete-recurring-transaction/delete-recurring-transaction.controller';
import { DeleteRecurringTransactionHandler } from './features/delete-recurring-transaction/delete-recurring-transaction.handler';
import { DeleteTransactionController } from './features/delete-transaction/delete-transaction.controller';
import { DeleteTransactionHandler } from './features/delete-transaction/delete-transaction.handler';
import { FindRecurringTransactionController } from './features/find-recurring-transaction/find-recurring-transaction.controller';
import { FindRecurringTransactionHandler } from './features/find-recurring-transaction/find-recurring-transaction.handle';
import { FindTransactionController } from './features/find-transaction/find-transaction.controller';
import { FindTransactionByIdHandler } from './features/find-transaction/find-transaction.handle';
import { ListRecurringTransactionsController } from './features/list-recurring-transactions/list-recurring-transactions.controller';
import { ListRecurringTransactionsHandler } from './features/list-recurring-transactions/list-recurring-transactions.handler';
import { ListTransactionController } from './features/list-transaction/list-transaction.controller';
import { ListTransactionByIdHandler } from './features/list-transaction/list-transaction.handler';
import { ToggleActiveRecurringTransactionController } from './features/toggle-active-recurring-transaction/toggle-active-recurring-transaction.controller';
import { ToggleActiveRecurringTransactionHandler } from './features/toggle-active-recurring-transaction/toggle-active-recurring-transaction.handler';
import { ToggleTransactionStatusController } from './features/toggle-transaction-status/toggle-transaction-status.controller';
import { ToggleTransactionStatusHandler } from './features/toggle-transaction-status/toggle-transaction-status.handler';
import { UpdateRecurringTransactionController } from './features/update-recurring-transaction/update-recurring-transaction.controller';
import { UpdateRecurringTransactionHandler } from './features/update-recurring-transaction/update-recurring-transaction.handler';
import { UpdateTransactionController } from './features/update-transaction/update-transaction.controller';
import { UpdateTransactionHandler } from './features/update-transaction/update-transaction.handler';
import { GenerateRecurringTransactionJobController } from './jobs/create-recurring-transaction.controller';
import { GenerateRecurringTransactionsJobHandler } from './jobs/create-recurring-transaction.handler';
import { CalculateNextGenerationDateService } from './services/calculate-next-generation-date.service';
import { GenerateRecurringTransactionsService } from './services/generate-recurring-transactions.service';

@Module({
  controllers: [
    CreateTransactionController,
    DeleteTransactionController,
    FindMonthSummaryController,
    FindTransactionController,
    ListTransactionController,
    UpdateTransactionController,
    ToggleTransactionStatusController,
    CreateRecurringTransactionController,
    GenerateRecurringTransactionJobController,
    UpdateRecurringTransactionController,
    DeleteRecurringTransactionController,
    ListRecurringTransactionsController,
    FindRecurringTransactionController,
    ToggleActiveRecurringTransactionController,
    DeleteRecurringTransactionController,
    DeleteTransactionController,
    ToggleActiveRecurringTransactionController,
  ],
  imports: [DatabaseModule, UserModule],
  providers: [
    CreateTransactionHandler,
    DeleteTransactionHandler,
    FindMonthSummaryHandler,
    FindTransactionByIdHandler,
    ListTransactionByIdHandler,
    UpdateTransactionHandler,
    ToggleTransactionStatusHandler,
    CreateRecurringTransactionHandler,
    UpdateRecurringTransactionHandler,
    DeleteRecurringTransactionHandler,
    ListRecurringTransactionsHandler,
    FindRecurringTransactionHandler,
    ToggleActiveRecurringTransactionHandler,
    CalculateNextGenerationDateService,
    GenerateRecurringTransactionsService,
    GenerateRecurringTransactionsJobHandler,
  ],
})
export class TransactionModule {}
