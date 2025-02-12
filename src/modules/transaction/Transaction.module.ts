import { DatabaseModule } from '@infra/databases/Database.module';
import { MemberModule } from '@modules/member/Member.module';
import { Module } from '@nestjs/common';
import { CreateTransactionController } from './controllers/CreateTransaction.controller';
import { FindMonthlySummaryWithPercentageController } from './controllers/FindMonthlySummaryWithPercentage.controller';
import { FindTransactionController } from './controllers/FindTransaction.controller';
import { FindTransactionSummaryByMemberIdController } from './controllers/FindTransactionSummaryByMemberId.controller';
import { ListTransactionController } from './controllers/ListTransaction.controller';
import { UpdateTransactionController } from './controllers/UpdateMemberGeneralInfos';
import { CreateTransactionService } from './services/CreateTransaction.service';
import { FindMonthlySummaryWithPercentageService } from './services/FindMonthSummary.service';
import { FindTransactionByIdService } from './services/FindTransactionById.service';
import { FindTransactionSummaryByMemberIdService } from './services/FindTransactionSummaryByMemberId.service';
import { ListTransactionByIdService } from './services/ListTransactionById.service';
import { UpdateTransactionService } from './services/UpdateTransaction.service';

@Module({
  controllers: [
    CreateTransactionController,
    FindMonthlySummaryWithPercentageController,
    FindTransactionSummaryByMemberIdController,
    FindTransactionController,
    ListTransactionController,
    UpdateTransactionController,
  ],
  imports: [DatabaseModule, MemberModule],
  providers: [
    CreateTransactionService,
    FindMonthlySummaryWithPercentageService,
    FindTransactionSummaryByMemberIdService,
    FindTransactionByIdService,
    ListTransactionByIdService,
    UpdateTransactionService,
  ],
})
export class TransactionModule {}
