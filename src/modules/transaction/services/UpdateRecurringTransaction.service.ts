import { RecurrenceFrequency } from '@constants/enums';
import { CategoryRepository } from '@modules/category/repositories/contracts/CategoryRepository';
import { Injectable } from '@nestjs/common';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { RecurringTransaction } from '../entities/RecurringTransaction';
import { InvalidAmountError } from '../errors/InvalidAmountError';
import { RecurringTransactionNotFoundError } from '../errors/RecurringTransactionNotFoundError';
import { RecurringTransactionRepository } from '../repositories/contracts/RecurringTransactionRepository';

interface UpdateRecurringTransactionRequest {
  recurringTransactionId: string;
  workspaceId: string;
  categoryId?: string | null;
  description?: string;
  amount?: number; // Decimal
  frequency?: string;
  interval?: number;
  startDate?: Date;
  endDate?: Date | null;
  sub: string;
}

type Errors =
  | UnauthorizedError
  | InvalidAmountError
  | RecurringTransactionNotFoundError;

type Response = {
  recurringTransaction: RecurringTransaction;
};

@Injectable()
export class UpdateRecurringTransactionService
  implements Service<UpdateRecurringTransactionRequest, Errors, Response>
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
  }: UpdateRecurringTransactionRequest): Promise<Either<Errors, Response>> {
    const recurring = await this.recurringRepository.findById(
      recurringTransactionId,
    );

    if (!recurring) {
      return left(new RecurringTransactionNotFoundError());
    }

    if (recurring.workspaceId !== workspaceId) {
      return left(new UnauthorizedError());
    }

    if (categoryId) {
      const category = await this.categoryRepository.findById(categoryId);

      const isGlobalCategory = !category?.workspaceId;
      const belongsToWorkspace = category?.workspaceId === workspaceId;

      if (!category || (!isGlobalCategory && !belongsToWorkspace)) {
        return left(new UnauthorizedError());
      }
    }

    if (description !== undefined) {
      recurring.description = description;
    }

    if (amount !== undefined) {
      if (amount <= 0) {
        return left(new InvalidAmountError());
      }
      recurring.amount = BigInt(Math.round(amount * 100));
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

    return right({ recurringTransaction: updated });
  }
}
