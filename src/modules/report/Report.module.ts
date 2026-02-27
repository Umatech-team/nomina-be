import { DatabaseModule } from '@infra/databases/Database.module';
import { FindMonthSummaryController } from '@modules/transaction/controllers/FindMonthSummary.controller';
import { Module } from '@nestjs/common';
import { BalanceEvolutionController } from './features/get-balance-evolution/get-balance-evolution.controller';
import { BalanceEvolutionHandler } from './features/get-balance-evolution/get-balance-evolution.handler';
import { CashFlowEvolutionController } from './features/get-cash-flow-evolution/cash-flow-evolution.controller';
import { CashFlowEvolutionHandler } from './features/get-cash-flow-evolution/cash-flow-evolution.handler';
import { GetExpensesByCategoryController } from './features/get-expenses-by-category/get-expenses-by-category.controller';
import { GetExpensesByCategoryHandler } from './features/get-expenses-by-category/get-expenses-by-category.handler';
import { FindMonthSummaryHandler } from './features/get-month-summary/get-month-summary.handler';

@Module({
  imports: [DatabaseModule],
  controllers: [
    CashFlowEvolutionController,
    GetExpensesByCategoryController,
    BalanceEvolutionController,
    FindMonthSummaryController,
  ],
  providers: [
    CashFlowEvolutionHandler,
    GetExpensesByCategoryHandler,
    BalanceEvolutionHandler,
    FindMonthSummaryHandler,
  ],
})
export class ReportModule {}
