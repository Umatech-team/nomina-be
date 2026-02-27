import { DatabaseModule } from '@infra/databases/Database.module';
import { FindMonthSummaryHandler } from '@modules/report/features/get-month-summary/get-month-summary.handler';
import { UserModule } from '@modules/user/User.module';
import { Module } from '@nestjs/common';
import { CreateRecurringTransactionController } from './controllers/CreateRecurringTransaction.controller';
import { CreateTransactionController } from './controllers/CreateTransaction.controller';
import { DeleteRecurringTransactionController } from './controllers/DeleteRecurringTransaction.controller';
import { DeleteTransactionController } from './controllers/DeleteTransaction.controller';
import { FindMonthSummaryController } from './controllers/FindMonthSummary.controller';
import { FindRecurringTransactionController } from './controllers/FindRecurringTransaction.controller';
import { FindTransactionController } from './controllers/FindTransaction.controller';
import { ListRecurringTransactionsController } from './controllers/ListRecurringTransactions.controller';
import { ListTransactionController } from './controllers/ListTransaction.controller';
import { ListTransactionSummaryByWorkspaceIdController } from './controllers/ListTransactionSummaryByWorkspaceId.controller';
import { ToggleActiveRecurringTransactionController } from './controllers/ToggleActiveRecurringTransaction.controller';
import { ToggleTransactionStatusController } from './controllers/ToggleTransactionStatus.controller';
import { UpdateRecurringTransactionController } from './controllers/UpdateRecurringTransaction.controller';
import { UpdateTransactionController } from './controllers/UpdateTransaction.controller';
import { CreateRecurringTransactionHandler } from './features/create-recurring-transaction/create-recurring-transaction.handle';
import { CreateTransactionHandler } from './features/create-transaction/create-transaction.handle';
import { DeleteRecurringTransactionHandler } from './features/delete-recurring-transaction/delete-recurring-transaction.handler';
import { DeleteTransactionHandler } from './features/delete-transaction/delete-transaction.handler';
import { FindRecurringTransactionHandler } from './features/find-recurring-transaction/find-recurring-transaction.handle';
import { FindTransactionByIdHandler } from './features/find-transaction/find-transaction.handle';
import { ListRecurringTransactionsHandler } from './features/list-recurring-transactions/list-recurring-transactions.handler';
import { ListTransactionByIdHandler } from './features/list-transaction/list-transaction.handler';
import { ToggleActiveRecurringTransactionHandler } from './features/toggle-active-recurring-transaction/toggle-active-recurring-transaction.handler';
import { ToggleTransactionStatusHandler } from './features/toggle-transaction-status/toggle-transaction-status.handler';
import { UpdateRecurringTransactionHandler } from './features/update-recurring-transaction/update-recurring-transaction.handler';
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
    ListTransactionSummaryByWorkspaceIdController,
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
    ListTransactionSummaryByWorkspaceIdHandler,
    ListTopExpensesByCategoryHandler,
    FindTransactionByIdHandler,
    ListTransactionByIdHandler,
    UpdateTransactionHandler,
    ToggleTransactionStatusHandler,
    // Recurring Transaction Handlers
    CreateRecurringTransactionHandler,
    UpdateRecurringTransactionHandler,
    DeleteRecurringTransactionHandler,
    ListRecurringTransactionsHandler,
    FindRecurringTransactionHandler,
    ToggleActiveRecurringTransactionHandler,
    // Recurring Generation Handlers
    CalculateNextGenerationDateService,
    GenerateRecurringTransactionsService,
    GenerateRecurringTransactionsJobHandler,
  ],
})
export class TransactionModule {}
