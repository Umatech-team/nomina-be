import { DatabaseModule } from '@infra/databases/Database.module';
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
import { CalculateNextGenerationDateService } from './services/CalculateNextGenerationDate.service';
import { CreateRecurringTransactionService } from './services/CreateRecurringTransaction.service';
import { CreateTransactionService } from './services/CreateTransaction.service';
import { DeleteRecurringTransactionService } from './services/DeleteRecurringTransaction.service';
import { DeleteTransactionService } from './services/DeleteTransaction.service';
import { FindMonthSummaryService } from './services/FindMonthSummary.service';
import { FindRecurringTransactionService } from './services/FindRecurringTransaction.service';
import { FindTransactionByIdService } from './services/FindTransactionById.service';
import { ListTransactionSummaryByWorkspaceIdService } from './services/FindTransactionSummaryByMemberId.service';
import { GenerateRecurringTransactionsService } from './services/GenerateRecurringTransactions.service';
import { ListRecurringTransactionsService } from './services/ListRecurringTransactions.service';
import { ListTopExpensesByCategoryService } from './services/ListTopExpensesByCategory.service';
import { ListTransactionByIdService } from './services/ListTransactionById.service';
import { ToggleActiveRecurringTransactionService } from './services/ToggleActiveRecurringTransaction.service';
import { ToggleTransactionStatusService } from './services/ToggleTransactionStatus.service';
import { UpdateRecurringTransactionService } from './services/UpdateRecurringTransaction.service';
import { UpdateTransactionService } from './services/UpdateTransaction.service';

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
    // Recurring Transaction Controllers
    CreateRecurringTransactionController,
    UpdateRecurringTransactionController,
    DeleteRecurringTransactionController,
    ListRecurringTransactionsController,
    FindRecurringTransactionController,
    ToggleActiveRecurringTransactionController,
  ],
  imports: [DatabaseModule, UserModule],
  providers: [
    CreateTransactionService,
    DeleteTransactionService,
    FindMonthSummaryService,
    ListTransactionSummaryByWorkspaceIdService,
    ListTopExpensesByCategoryService,
    FindTransactionByIdService,
    ListTransactionByIdService,
    UpdateTransactionService,
    ToggleTransactionStatusService,
    // Recurring Transaction Services
    CreateRecurringTransactionService,
    UpdateRecurringTransactionService,
    DeleteRecurringTransactionService,
    ListRecurringTransactionsService,
    FindRecurringTransactionService,
    ToggleActiveRecurringTransactionService,
    // Recurring Generation Services
    CalculateNextGenerationDateService,
    GenerateRecurringTransactionsService,
  ],
})
export class TransactionModule {}
