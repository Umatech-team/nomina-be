import { DatabaseModule } from '@infra/databases/Database.module';
import { Module } from '@nestjs/common';
import { GetCashFlowEvolutionController } from './controllers/GetCashFlowEvolution.controller';
import { GetExpensesByCategoryController } from './controllers/GetExpensesByCategory.controller';
import { GetFinancialPositionController } from './controllers/GetFinancialPosition.controller';
import { GetCashFlowEvolutionService } from './services/GetCashFlowEvolution.service';
import { GetExpensesByCategoryService } from './services/GetExpensesByCategory.service';
import { GetFinancialPositionService } from './services/GetFinancialPosition.service';

@Module({
  imports: [DatabaseModule],
  controllers: [
    GetExpensesByCategoryController,
    GetCashFlowEvolutionController,
    GetFinancialPositionController,
  ],
  providers: [
    GetExpensesByCategoryService,
    GetCashFlowEvolutionService,
    GetFinancialPositionService,
  ],
})
export class ReportModule {}
