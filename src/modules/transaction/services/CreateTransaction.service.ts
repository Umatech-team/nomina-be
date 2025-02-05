import { MemberRepository } from '@modules/member/repositories/contracts/MemberRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { CreateTransactionDTO } from '../dto/CreateTransactionDTO';
import { Transaction } from '../entities/Transaction';
import { InsufficientBalanceError } from '../errors/InsufficientBalanceError';
import { InvalidAmountError } from '../errors/InvalidAmountError';
import { TransactionRepository } from '../repositories/contracts/TransactionRepository';

type Request = CreateTransactionDTO & TokenPayloadSchema;
type Errors = UnauthorizedError | InsufficientBalanceError | InvalidAmountError;
type Response = {
  transaction: Transaction;
  newBalance: number;
};

@Injectable()
export class CreateTransactionService
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly memberRepository: MemberRepository,
  ) {}

  async execute({
    sub,
    amount,
    category,
    date,
    description,
    currency,
    type,
  }: Request): Promise<Either<Errors, Response>> {
    const member = await this.memberRepository.findUniqueById(sub);

    if (!member) {
      return left(new UnauthorizedError());
    }

    if (amount <= 0) {
      return left(new InvalidAmountError());
    }

    // if (type === 'EXPENSE' && amount > member.balance) {
    //   return left(new InsufficientBalanceError());
    // }

    const transaction = new Transaction({
      memberId: sub,
      amount,
      category,
      date,
      description,
      currency,
      type,
    });

    await this.transactionRepository.create(transaction);

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
