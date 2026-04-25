import { RecurringTransaction } from '@modules/transaction/entities/RecurringTransaction';
import { RecurringTransactionRepository } from '@modules/transaction/repositories/contracts/RecurringTransactionRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { DeleteRecurringTransactionRequest } from './delete-recurring-transaction.dto';

type Request = DeleteRecurringTransactionRequest &
  Pick<TokenPayloadBase, 'workspaceId'>;

type Errors = HttpException;

type Response = RecurringTransaction;

@Injectable()
export class DeleteRecurringTransactionService implements Service<
  Request,
  Errors,
  Response
> {
  constructor(
    private readonly recurringRepository: RecurringTransactionRepository,
  ) {}

  async execute({
    recurringTransactionId,
    workspaceId,
  }: Request): Promise<Either<Errors, Response>> {
    const recurring = await this.recurringRepository.findById(
      recurringTransactionId,
    );

    if (!recurring) {
      return left(new HttpException('Transaction not found', 404));
    }

    if (recurring.workspaceId !== workspaceId) {
      return left(new HttpException('Unauthorized', 403));
    }

    await this.recurringRepository.delete(recurringTransactionId);

    return right(recurring);
  }
}
