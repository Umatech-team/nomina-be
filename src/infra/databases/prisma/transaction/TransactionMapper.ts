import { TransactionStatus, TransactionType } from '@constants/enums';
import { Transaction } from '@modules/transaction/entities/Transaction';
import { Prisma, Transaction as TransactionPrisma } from '@prisma/client';

export class TransactionMapper {
  static toEntity(raw: TransactionPrisma): Transaction {
    return new Transaction(
      {
        workspaceId: raw.workspaceId,
        accountId: raw.accountId,
        categoryId: raw.categoryId,
        description: raw.description,
        amount: raw.amount,
        date: raw.date,
        type: raw.type as TransactionType,
        status: raw.status as TransactionStatus,
        recurringId: raw.recurringTransactionId,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }

  static toPrisma(entity: Transaction): Prisma.TransactionUncheckedCreateInput {
    return {
      id: entity.id,
      workspaceId: entity.workspaceId,
      accountId: entity.accountId,
      categoryId: entity.categoryId,
      description: entity.description,
      amount: entity.amount,
      date: entity.date,
      type: entity.type,
      status: entity.status,
      recurringTransactionId: entity.recurringId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
      date: entity.date,
      income: entity.income,
      expense: entity.expense,
    });
  }

  static toMonthSummaryWithPercentage(
    entity: MonthSumarryWithPercentageType,
  ): MonthSumarryWithPercentage {
    return new MonthSumarryWithPercentage({
      ...entity,
      percentageChanges: entity.percentageChanges,
    });
  }

  static toTopExpensesByCategory(
    entity: TopExpensesByCategory,
  ): TopExpensesByCategory {
    return new TopExpensesByCategory({
      category: entity.category,
      total: entity.total,
    });
  }
}
