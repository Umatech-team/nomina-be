import { UserRepository } from '@modules/user/repositories/contracts/UserRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { TransactionNotFoundError } from '../errors/TransactionNotFoundError';
import { TransactionRepository } from '../repositories/contracts/TransactionRepository';
import { TransactionSummary } from '../valueObjects/TransactionSummary';

type Request = TokenPayloadBase & { period: '7d' | '30d' };

type Errors = TransactionNotFoundError | UnauthorizedError;

type Response = {
  summary: TransactionSummary[];
};

@Injectable()
export class ListTransactionSummaryByWorkspaceIdService
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({
    sub,
    workspaceId,
    period,
  }: Request): Promise<Either<Errors, Response>> {
    const user = await this.userRepository.findUniqueById(sub);

    if (!user) {
      return left(new TransactionNotFoundError());
    }

    const summary =
      await this.transactionRepository.listTransactionsSummaryByWorkspaceId(
        workspaceId,
        period,
      );

    if (!summary) {
      return left(new TransactionNotFoundError());
    }

    return right({
      summary,
    });
  }
}
