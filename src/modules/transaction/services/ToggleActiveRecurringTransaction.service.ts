import { Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { RecurringTransaction } from '../entities/RecurringTransaction';
import { RecurringTransactionNotFoundError } from '../errors/RecurringTransactionNotFoundError';
import { RecurringTransactionRepository } from '../repositories/contracts/RecurringTransactionRepository';

type Request = { recurringTransactionId: string } & TokenPayloadBase;
type Errors = UnauthorizedError | RecurringTransactionNotFoundError;

type Response = {
  recurringTransaction: RecurringTransaction;
};

@Injectable()
export class ToggleActiveRecurringTransactionService
  implements Service<Request, Errors, Response>
{
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
      return left(new RecurringTransactionNotFoundError());
    }

    if (recurring.workspaceId !== workspaceId) {
      return left(new UnauthorizedError());
    }

    if (recurring.active) {
      recurring.deactivate();
    } else {
      recurring.activate();
    }

    const updated = await this.recurringRepository.update(recurring);

    return right({ recurringTransaction: updated });
  }
}
