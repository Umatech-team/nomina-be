import { DatabaseModule } from '@infra/databases/Database.module';
import { Module } from '@nestjs/common';
import { CashFlowEvolutionController } from './features/cash-flow-evolution/cash-flow-evolution.controller';
import { CashFlowEvolutionHandler } from './features/cash-flow-evolution/cash-flow-evolution.handler';
import { GetExpensesByCategoryController } from './features/get-expenses-by-category/get-expenses-by-category.controller';
import { GetExpensesByCategoryHandler } from './features/get-expenses-by-category/get-expenses-by-category.handler';

@Module({
  imports: [DatabaseModule],
  controllers: [CashFlowEvolutionController, GetExpensesByCategoryController],
  providers: [CashFlowEvolutionHandler, GetExpensesByCategoryHandler],
})
export class ReportModule {}
