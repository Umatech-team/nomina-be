import { DatabaseModule } from '@infra/databases/Database.module';
import { MemberModule } from '@modules/member/Member.module';
import { Module } from '@nestjs/common';
import { CreateTransactionController } from './controllers/CreateTransaction.controller';
import { FindTransactionController } from './controllers/FindTransaction.controller';
import { ListTransactionController } from './controllers/ListTransaction.controller';
import { UpdateTransactionController } from './controllers/UpdateMemberGeneralInfos';
import { CreateTransactionService } from './services/CreateTransaction.service';
import { FindTransactionByIdService } from './services/FindTransactionById.service';
import { ListTransactionByIdService } from './services/ListTransactionById.service';
import { UpdateTransactionService } from './services/UpdateTransaction.service';

@Module({
  controllers: [
    CreateTransactionController,
    FindTransactionController,
    ListTransactionController,
    UpdateTransactionController,
  ],
  imports: [DatabaseModule, MemberModule],
  providers: [
    CreateTransactionService,
    FindTransactionByIdService,
    ListTransactionByIdService,
    UpdateTransactionService,
  ],
})
export class TransactionModule {}
