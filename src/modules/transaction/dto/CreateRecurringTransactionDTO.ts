import { OmitType } from '@nestjs/swagger';
import { RecurringTransactionDTO } from './RecurringTransactionDTO';

export class CreateRecurringTransactionDTO extends OmitType(
  RecurringTransactionDTO,
  ['id', 'workspaceId', 'lastGenerated'],
) {}
