import { TransactionType } from '@constants/enums';
import { UserRepository } from '@modules/user/repositories/contracts/UserRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { MoneyUtils } from '@utils/MoneyUtils';
import { CreateTransactionDTO } from '../dto/CreateTransactionDTO';
import { Transaction } from '../entities/Transaction';
import { InsufficientBalanceError } from '../errors/InsufficientBalanceError';
import { InvalidAmountError } from '../errors/InvalidAmountError';
import { TransactionRepository } from '../repositories/contracts/TransactionRepository';
import { MonthSumarryWithPercentage } from '../valueObjects/MonthSumarryWithPercentage';

type Request = CreateTransactionDTO & TokenPayloadSchema;
type Errors = UnauthorizedError | InsufficientBalanceError | InvalidAmountError;
type Response = {
  transaction: Transaction;
  newSummary: MonthSumarryWithPercentage;
};

@Injectable()
export class CreateTransactionService
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({
    sub,
    amount,
    category,
    subCategory,
    date,
    description,
    currency,
    type,
    method,
    title,
  }: Request): Promise<Either<Errors, Response>> {
    const user = await this.userRepository.findUniqueById(sub);
    amount = MoneyUtils.decimalToCents(amount);

    if (!user) {
      return left(new UnauthorizedError());
    }

    if (amount <= 0) {
      return left(new InvalidAmountError());
    }

    const transaction = new Transaction({
      userId: sub,
      amount,
      category,
      subCategory,
      date,
      description,
      currency,
      type,
      method,
      title,
    });

    await this.transactionRepository.create(transaction);

    await this.updateMonthlySummaryIncrementally(
      user.id,
      amount,
      category === 'INVESTMENT' ? ('INVESTMENT' as TransactionType) : type,
    );

    const newSummary = await this.transactionRepository.getMonthlySummary(
      user.id,
      new Date(),
    );

    return right({
      transaction,
      newSummary,
    });
  }

  private async updateMonthlySummaryIncrementally(
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
      totalIncome += amount;
      balance += amount;
    } else if (type === 'EXPENSE') {
      totalExpense += amount;
      balance -= amount;
    } else if (type === 'INVESTMENT') {
      totalInvestments += amount;
      balance -= amount;
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
