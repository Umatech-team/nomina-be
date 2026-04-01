import { RecurrenceFrequency, TransactionType } from '@constants/enums';
import * as schema from '@infra/databases/drizzle/schema';
import { RecurringTransaction } from '@modules/transaction/entities/RecurringTransaction';

type RecurringTransactionDrizzle =
  typeof schema.recurringTransactions.$inferSelect;
type RecurringTransactionDrizzleInsert =
  typeof schema.recurringTransactions.$inferInsert;

export class RecurringTransactionMapper {
  static toDomain(raw: RecurringTransactionDrizzle): RecurringTransaction {
    return new RecurringTransaction(
      {
        accountId: raw.accountId,
        destinationAccountId: raw.destinationAccountId ?? null,
        amount: BigInt(raw.amount),
        categoryId: raw.categoryId,
        title: raw.title,
        description: raw.description,
        workspaceId: raw.workspaceId,
        frequency: raw.frequency as RecurrenceFrequency,
        startDate: raw.startDate,
        endDate: raw.endDate,
        active: raw.active,
        type: raw.type as TransactionType,
        interval: raw.interval,
        lastGenerated: raw.lastGenerated,
      },
      raw.id,
    );
  }

  static toDatabase(
    entity: RecurringTransaction,
  ): RecurringTransactionDrizzleInsert {
    return {
      id: entity.id,
      accountId: entity.accountId,
      destinationAccountId: entity.destinationAccountId,
      amount: Number(entity.amount),
      categoryId: entity.categoryId,
      title: entity.title,
      description: entity.description,
      workspaceId: entity.workspaceId,
      frequency: entity.frequency,
      startDate: entity.startDate,
      endDate: entity.endDate,
      active: entity.active,
      type: entity.type,
      interval: entity.interval,
      lastGenerated: entity.lastGenerated,
    };
  }
}
