import { RecurrenceFrequency } from '@constants/enums';
import { RecurringTransaction } from '@modules/transaction/entities/RecurringTransaction';
import {
  Prisma,
  RecurringTransaction as RecurringTransactionPrisma,
} from '@prisma/client';

export class RecurringTransactionMapper {
  static toEntity(raw: RecurringTransactionPrisma): RecurringTransaction {
    return new RecurringTransaction(
      {
        workspaceId: raw.workspaceId,
        accountId: raw.accountId,
        categoryId: raw.categoryId,
        description: raw.description,
        amount: raw.amount,
        frequency: raw.frequency as RecurrenceFrequency,
        interval: raw.interval,
        startDate: raw.startDate,
        endDate: raw.endDate,
        lastGenerated: raw.lastGenerated,
        active: raw.active,
      },
      raw.id,
    );
  }

  static toPrisma(
    entity: RecurringTransaction,
  ): Prisma.RecurringTransactionUncheckedCreateInput {
    return {
      id: entity.id,
      workspaceId: entity.workspaceId,
      accountId: entity.accountId,
      categoryId: entity.categoryId,
      description: entity.description,
      amount: entity.amount,
      frequency: entity.frequency,
      interval: entity.interval,
      startDate: entity.startDate,
      endDate: entity.endDate,
      lastGenerated: entity.lastGenerated,
      active: entity.active,
    };
  }
}
