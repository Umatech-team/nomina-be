import { MemberRepository } from '@modules/member/repositories/contracts/MemberRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { ListTransactionsDTO } from '../dto/ListTransactionsDTO';
import { Transaction } from '../entities/Transaction';
import { TransactionNotFoundError } from '../errors/TransactionNotFoundError';
import { TransactionRepository } from '../repositories/contracts/TransactionRepository';

type Request = ListTransactionsDTO & TokenPayloadSchema;

type Errors = TransactionNotFoundError | UnauthorizedError;

type Response = {
  transaction: Transaction[];
};

@Injectable()
export class ListTransactionByIdService
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly memberRepository: MemberRepository,
  ) {}

  async execute({
    sub,
    startDate,
    endDate,
    page,
    pageSize,
  }: Request): Promise<Either<Errors, Response>> {
    const member = await this.memberRepository.findUniqueById(sub);

    if (!member) {
      return left(new TransactionNotFoundError());
    }

    const transaction =
      await this.transactionRepository.listTransactionsByMemberId(
        sub,
        page,
        pageSize,
        startDate,
        endDate,
      );

    if (!transaction) {
      return left(new TransactionNotFoundError());
    }

    return right({
      transaction,
    });
  }
}
