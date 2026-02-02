import { RecurringTransaction } from '@modules/transaction/entities/RecurringTransaction';

export abstract class RecurringTransactionRepository {
  abstract create(
    recurringTransaction: RecurringTransaction,
  ): Promise<RecurringTransaction>;

  abstract update(
    recurringTransaction: RecurringTransaction,
  ): Promise<RecurringTransaction>;

  abstract delete(id: string): Promise<void>;
  abstract findById(id: string): Promise<RecurringTransaction | null>;

  abstract findByWorkspaceId(
    workspaceId: string,
  ): Promise<RecurringTransaction[]>;

  // Para lazy generation
  abstract findActiveByWorkspaceId(
    workspaceId: string,
  ): Promise<RecurringTransaction[]>;

  // Para verificar quais precisam gerar hoje
  abstract findActiveNeedingGeneration(
    workspaceId: string,
    referenceDate: Date,
  ): Promise<RecurringTransaction[]>;
}
