import { UserRepository } from '@modules/user/repositories/contracts/UserRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { MoneyUtils } from '@utils/MoneyUtils';
import { UpdateTransactionDTO } from '../dto/UpdateTransactionDTO';
import { Transaction } from '../entities/Transaction';
import { InvalidAmountError } from '../errors/InvalidAmountError';
import { TransactionNotFoundError } from '../errors/TransactionNotFoundError';
import { TransactionRepository } from '../repositories/contracts/TransactionRepository';

type Request = UpdateTransactionDTO & TokenPayloadSchema;

type Errors = UnauthorizedError | InvalidAmountError | TransactionNotFoundError;

type Response = {
  transaction: Transaction;
  newBalance: number;
};
@Injectable()
export class UpdateTransactionService
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({
    sub,
    transactionId,
    title,
    type,
    method,
    description,
    category,
    amount,
    currency,
    date,
  }: Request): Promise<Either<Errors, Response>> {
    const user = await this.userRepository.findUniqueById(sub);
    amount = MoneyUtils.decimalToCents(amount);

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

    if (amount <= 0) {
      return left(new InvalidAmountError());
    }

    transaction.title = title;
    transaction.amount = amount;
    transaction.category = category;
    transaction.currency = currency;
    transaction.date = date;
    transaction.description = description as string;
    transaction.type = type;
    transaction.method = method;

    await this.transactionRepository.update(transaction);

    if (type === 'EXPENSE') {
      user.balance -= amount;
    } else {
      user.balance += amount;
    }

    await this.userRepository.update(user);

    return right({
      transaction,
      newBalance: user.balance,
    });
  }
}
