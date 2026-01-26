import { OmitType } from '@nestjs/swagger';
import { TransactionDTO } from './TransactionDTO';

export class CreateTransactionDTO extends OmitType(TransactionDTO, [
  'id',
  'createdAt',
  'updatedAt',
  'workspaceId',
  'recurringId',
]) {}
