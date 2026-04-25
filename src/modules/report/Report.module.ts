import { DatabaseModule } from '@infra/databases/Database.module';
import { Module } from '@nestjs/common';
import { BalanceEvolutionController } from './features/get-balance-evolution/get-balance-evolution.controller';
import { BalanceEvolutionService } from './features/get-balance-evolution/get-balance-evolution.service';
import { CashFlowEvolutionController } from './features/get-cash-flow-evolution/cash-flow-evolution.controller';
import { CashFlowEvolutionService } from './features/get-cash-flow-evolution/cash-flow-evolution.service';
import { GetExpensesByCategoryController } from './features/get-expenses-by-category/get-expenses-by-category.controller';
import { GetExpensesByCategoryService } from './features/get-expenses-by-category/get-expenses-by-category.service';
import { FindMonthSummaryController } from './features/get-month-summary/get-month-summary.controller';
import { FindMonthSummaryService } from './features/get-month-summary/get-month-summary.service';

@Module({
  imports: [DatabaseModule],
  controllers: [
    CashFlowEvolutionController,
    GetExpensesByCategoryController,
    BalanceEvolutionController,
    FindMonthSummaryController,
  ],
  providers: [
    CashFlowEvolutionService,
    GetExpensesByCategoryService,
    BalanceEvolutionService,
    FindMonthSummaryService,
  ],
})
export class ReportModule {}
