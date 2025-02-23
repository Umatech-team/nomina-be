import { TransactionMethod, TransactionType } from '@constants/enums';
import { Transaction } from '@modules/transaction/entities/Transaction';
import {
  MonthSumarryWithPercentage,
  MonthSumarryWithPercentageType,
} from '@modules/transaction/valueObjects/MonthSumarryWithPercentage';
import { TopExpensesByCategory } from '@modules/transaction/valueObjects/TopExpensesByCategory';
import { TransactionSummary } from '@modules/transaction/valueObjects/TransactionSummary';
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
        subCategory: raw.subCategory,
        currency: raw.currency,
        amount: raw.amount,
        date: raw.date,
        description: raw.description,
        method: raw.method as TransactionMethod,
        title: raw.title,
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
      subCategory: entity.subCategory,
      currency: entity.currency,
      amount: entity.amount,
      date: entity.date,
      description: entity.description,
      method: entity.method as TransactionMethod,
      title: entity.title,
    };
  }

  static toTransactionSummary(entity: TransactionSummary): TransactionSummary {
    return new TransactionSummary({
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
