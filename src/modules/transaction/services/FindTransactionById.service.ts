import { MemberRepository } from '@modules/member/repositories/contracts/MemberRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { FindTransactionDTO } from '../dto/FindTransactionDTO';
import { Transaction } from '../entities/Transaction';
import { TransactionNotFoundError } from '../errors/TransactionNotFoundError';
import { TransactionRepository } from '../repositories/contracts/TransactionRepository';

type Request = FindTransactionDTO & TokenPayloadSchema;

type Errors = TransactionNotFoundError | UnauthorizedError;

type Response = {
  transaction: Transaction;
};

@Injectable()
export class FindTransactionByIdService
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly memberRepository: MemberRepository,
  ) {}

  async execute({
    sub,
    transactionId,
  }: Request): Promise<Either<Errors, Response>> {
    const member = await this.memberRepository.findUniqueById(sub);

    if (!member) {
      return left(new TransactionNotFoundError());
    }

    const transaction =
      await this.transactionRepository.findUniqueById(transactionId);

    if (!transaction) {
      return left(new TransactionNotFoundError());
    }

    return right({
      transaction,
    });
  }
}
