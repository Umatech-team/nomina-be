import { TransactionType } from '@constants/enums';
import { Transaction } from '@modules/transaction/entities/Transaction';
import { Prisma, Transaction as TransactionPrisma } from '@prisma/client';

export class TransactionMapper {
  static toEntity(raw: TransactionPrisma): Transaction {
    return new Transaction(
      {
        memberId: raw.memberId,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        type: raw.type as TransactionType,
        category: raw.category,
        currency: raw.currency,
        amount: raw.amount,
        date: raw.date,
        description: raw.description,
      },
      raw.id,
    );
  }

  static toPrisma(entity: Transaction): Prisma.TransactionUncheckedCreateInput {
    return {
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      memberId: entity.memberId,
      type: entity.type as TransactionType,
      category: entity.category,
      currency: entity.currency,
      amount: entity.amount,
      date: entity.date,
      description: entity.description,
    };
  }
}
