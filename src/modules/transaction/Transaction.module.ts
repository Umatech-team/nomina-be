import { DatabaseModule } from '@infra/databases/Database.module';
import { Module } from '@nestjs/common';
import { CreateTransactionController } from './controllers/CreateTransaction.controller';
import { DeleteTransactionController } from './controllers/DeleteTransaction.controller';
import { FindMonthlySummaryWithPercentageController } from './controllers/FindMonthlySummaryWithPercentage.controller';
import { FindTransactionController } from './controllers/FindTransaction.controller';
import { FindTransactionSummaryByUserIdController } from './controllers/FindTransactionSummaryByUserId.controller';
import { ListTransactionController } from './controllers/ListTransaction.controller';
import { TopExpensesByCategoryController } from './controllers/ListTransaction.controller copy';
import { UpdateTransactionController } from './controllers/UpdateUserGeneralInfos';
import { CreateTransactionService } from './services/CreateTransaction.service';
import { DeleteTransactionService } from './services/DeleteTransaction.service';
import { FindMonthlySummaryWithPercentageService } from './services/FindMonthSummary.service';
import { FindTransactionByIdService } from './services/FindTransactionById.service';
import { FindTransactionSummaryByUserIdService } from './services/FindTransactionSummaryByUserId.service';
import { ListTopExpensesByCategoryService } from './services/ListTopExpensesByCategory.service';
import { ListTransactionByIdService } from './services/ListTransactionById.service';
import { UpdateTransactionService } from './services/UpdateTransaction.service';

@Module({
  controllers: [
    CreateTransactionController,
    DeleteTransactionController,
    FindMonthlySummaryWithPercentageController,
    FindTransactionSummaryByUserIdController,
    TopExpensesByCategoryController,
    FindTransactionController,
    ListTransactionController,
    UpdateTransactionController,
  ],
  imports: [DatabaseModule, UserModule],
  providers: [
    CreateTransactionService,
    DeleteTransactionService,
    FindMonthlySummaryWithPercentageService,
    FindTransactionSummaryByUserIdService,
    ListTopExpensesByCategoryService,
    FindTransactionByIdService,
    ListTransactionByIdService,
    UpdateTransactionService,
  ],
})
export class TransactionModule {}
