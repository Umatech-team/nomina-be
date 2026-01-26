import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { RecurringTransactionDTO } from './RecurringTransactionDTO';

export class UpdateRecurringTransactionDTO extends OmitType(
  RecurringTransactionDTO,
  ['id', 'workspaceId', 'lastGenerated'],
) {
  @ApiProperty()
  @IsString()
  recurringTransactionId!: string;
}
