import { TransactionType } from '@constants/enums';
import { UserRepository } from '@modules/user/repositories/contracts/UserRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { FindTransactionDTO } from '../dto/FindTransactionDTO';
import { Transaction } from '../entities/Transaction';
import { InvalidAmountError } from '../errors/InvalidAmountError';
import { TransactionNotFoundError } from '../errors/TransactionNotFoundError';
import { TransactionRepository } from '../repositories/contracts/TransactionRepository';

type Request = FindTransactionDTO & TokenPayloadSchema;

type Errors = UnauthorizedError | InvalidAmountError | TransactionNotFoundError;

type Response = {
  transaction: Transaction;
};

@Injectable()
export class DeleteTransactionService
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({
    sub,
    transactionId,
  }: Request): Promise<Either<Errors, Response>> {
    const user = await this.userRepository.findUniqueById(sub);

    if (!user) {
      return left(new UnauthorizedError());
    }

    const transaction =
      await this.transactionRepository.findUniqueById(transactionId);

    if (!transaction) {
      return left(new TransactionNotFoundError());
    }

    if (transaction.userId !== sub) {
      return left(new UnauthorizedError());
    }

    await this.transactionRepository.delete(transactionId);

    await this.updateMonthlySummaryDecrementally(
      user.id,
      transaction.amount,
      transaction.category === 'INVESTMENT'
        ? ('INVESTMENT' as TransactionType)
        : (transaction.type as TransactionType),
    );

    return right({
      transaction,
    });
  }

  private async updateMonthlySummaryDecrementally(
    userId: number,
    amount: number,
    type: TransactionType,
  ): Promise<void> {
    const month = new Date();
    const currentMonth = new Date(month.getFullYear(), month.getMonth(), 1);

    const currentSummary = await this.transactionRepository.getMonthlySummary(
      userId,
      currentMonth,
    );

    let totalIncome = currentSummary.totalIncome;
    let totalExpense = currentSummary.totalExpense;
    let totalInvestments = currentSummary.totalInvestments;
    let balance = currentSummary.balance;

    if (type === 'INCOME') {
      totalIncome -= amount;
      balance -= amount;
    } else if (type === 'EXPENSE') {
      totalExpense -= amount;
      balance += amount;
    } else if (type === 'INVESTMENT') {
      totalInvestments -= amount;
      balance += amount;
    }

    await this.transactionRepository.updateMonthlySummary(
      userId,
      currentMonth,
      totalIncome,
      totalExpense,
      totalInvestments,
      balance,
    );
  }
}
