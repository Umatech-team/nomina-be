import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { TransactionDTO } from './TransactionDTO';

export class UpdateTransactionDTO extends OmitType(TransactionDTO, [
  'id',
  'createdAt',
  'updatedAt',
  'workspaceId',
  'recurringId',
]) {
  @ApiProperty()
  @IsString()
  transactionId!: string;
}
