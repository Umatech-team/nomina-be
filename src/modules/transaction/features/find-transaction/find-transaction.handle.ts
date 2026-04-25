import { Transaction } from '@modules/transaction/entities/Transaction';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { FindTransactionRequest } from './find-transaction.dto';

type Request = FindTransactionRequest & Pick<TokenPayloadBase, 'sub'>;

type Errors = HttpException;

type Response = Transaction;

@Injectable()
export class FindTransactionByIdService implements Service<
  Request,
  Errors,
  Response
> {
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
      return left(new HttpException('Unauthorized', statusCode.UNAUTHORIZED));
    }

    const transaction =
      await this.transactionRepository.findUniqueById(transactionId);

    if (!transaction) {
      return left(
        new HttpException('Transaction not found', statusCode.NOT_FOUND),
      );
    }

    return right(transaction);
  }
}
