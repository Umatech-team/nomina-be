import { MemberRepository } from '@modules/member/repositories/contracts/MemberRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
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
    private readonly memberRepository: MemberRepository,
  ) {}

  async execute({
    sub,
    transactionId,
    currency,
    amount,
    category,
    date,
    description,
    type,
    method,
  }: Request): Promise<Either<Errors, Response>> {
    const member = await this.memberRepository.findUniqueById(sub);

    if (!member) {
      return left(new UnauthorizedError());
    }

    const transaction =
      await this.transactionRepository.findUniqueById(transactionId);

    if (!transaction) {
      return left(new TransactionNotFoundError());
    }

    if (transaction.memberId !== sub) {
      return left(new UnauthorizedError());
    }

    if (amount <= 0) {
      return left(new InvalidAmountError());
    }

    transaction.amount = amount;
    transaction.category = category;
    transaction.currency = currency;
    transaction.date = date;
    transaction.description = description as string;
    transaction.type = type;
    transaction.method = method;

    await this.transactionRepository.update(transaction);

    if (type === 'EXPENSE') {
      member.balance -= amount;
    } else {
      member.balance += amount;
    }

    await this.memberRepository.update(member);

    return right({
      transaction,
      newBalance: member.balance,
    });
  }
}
