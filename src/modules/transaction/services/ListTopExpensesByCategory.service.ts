import { UserRepository } from '@modules/user/repositories/contracts/UserRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { TopExpensesByCategoryDTO } from '../dto/ListTopExpensesByCategoryDTO';
import { TransactionNotFoundError } from '../errors/TransactionNotFoundError';
import { TransactionRepository } from '../repositories/contracts/TransactionRepository';
import { TopExpensesByCategory } from '../valueObjects/TopExpensesByCategory';

type Request = TopExpensesByCategoryDTO & TokenPayloadBase;

type Errors = TransactionNotFoundError | UnauthorizedError;

type Response = {
  expenses: TopExpensesByCategory[];
};

@Injectable()
export class ListTopExpensesByCategoryService
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
    pageSize,
  }: Request): Promise<Either<Errors, Response>> {
    const user = await this.userRepository.findUniqueById(sub);

    if (!user) {
      return left(new TransactionNotFoundError());
    }

    const expenses = await this.transactionRepository.getTopExpensesByCategory(
      sub,
      startDate,
      endDate,
      pageSize,
    );

    if (!expenses) {
      return left(new TransactionNotFoundError());
    }

    return right({
      expenses,
    });
  }
}
