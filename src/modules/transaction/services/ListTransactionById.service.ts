import { UserRepository } from '@modules/user/repositories/contracts/UserRepository';
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
    private readonly userRepository: UserRepository,
  ) {}

  async execute({
    sub,
    startDate,
    endDate,
    page,
    pageSize,
  }: Request): Promise<Either<Errors, Response>> {
    const user = await this.userRepository.findUniqueById(sub);

    if (!user) {
      return left(new TransactionNotFoundError());
    }

    const transaction =
      await this.transactionRepository.listTransactionsByUserId(
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
