import { OmitType } from '@nestjs/swagger';
import { TransactionDTO } from './TransactionDTO';

export class CreateTransactionDTO extends OmitType(TransactionDTO, [
  'createdAt',
  'updatedAt',
  'memberId',
]) {}
