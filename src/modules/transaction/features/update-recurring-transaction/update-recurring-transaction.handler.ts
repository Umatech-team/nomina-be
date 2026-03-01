import { RecurrenceFrequency } from '@constants/enums';
import { CategoryRepository } from '@modules/category/repositories/contracts/CategoryRepository';
import { RecurringTransaction } from '@modules/transaction/entities/RecurringTransaction';
import { RecurringTransactionRepository } from '@modules/transaction/repositories/contracts/RecurringTransactionRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UpdateRecurringTransactionRequest } from './update-recurring-transaction.dto';

type Request = UpdateRecurringTransactionRequest & {
  recurringTransactionId: string;
} & Pick<TokenPayloadBase, 'workspaceId'>;

type Errors = HttpException;

type Response = RecurringTransaction;

@Injectable()
export class UpdateRecurringTransactionHandler
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly recurringRepository: RecurringTransactionRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute({
    recurringTransactionId,
    workspaceId,
    categoryId,
    description,
    amount,
    frequency,
    interval,
    startDate,
    endDate,
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

    if (amount !== undefined) {
      if (amount <= 0) {
        return left(new HttpException('Invalid amount', 400));
      }
      recurring.amount = BigInt(amount);
    }

    if (startDate && startDate <= new Date()) {
      return left(
        new HttpException('Transação recorrente não pode começar hoje.', 400),
      );
    }

    if (categoryId) {
      const category = await this.categoryRepository.findById(categoryId);

      const isGlobalCategory = !category?.workspaceId;
      const belongsToWorkspace = category?.workspaceId === workspaceId;

      if (!category || (!isGlobalCategory && !belongsToWorkspace)) {
        return left(new HttpException('Unauthorized', 403));
      }
    }

    if (description !== undefined) {
      recurring.description = description;
    }

    if (frequency !== undefined) {
      recurring.frequency = frequency as RecurrenceFrequency;
    }

    if (interval !== undefined) {
      recurring.interval = interval;
    }

    if (startDate !== undefined) {
      recurring.startDate = startDate;
    }

    if (endDate !== undefined) {
      recurring.endDate = endDate;
    }

    const updated = await this.recurringRepository.update(recurring);

    return right(updated);
  }
}
