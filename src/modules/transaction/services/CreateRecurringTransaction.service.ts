import { RecurrenceFrequency } from '@constants/enums';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { CategoryRepository } from '@modules/category/repositories/contracts/CategoryRepository';
import { Injectable } from '@nestjs/common';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { RecurringTransaction } from '../entities/RecurringTransaction';
import { InvalidAmountError } from '../errors/InvalidAmountError';
import { RecurringTransactionRepository } from '../repositories/contracts/RecurringTransactionRepository';

interface CreateRecurringTransactionRequest {
  workspaceId: string;
  accountId: string;
  categoryId?: string | null;
  description: string;
  amount: number; // Decimal
  frequency: string;
  interval?: number;
  startDate: Date;
  endDate?: Date | null;
  active?: boolean;
  sub: string;
}

type Errors = UnauthorizedError | InvalidAmountError;

type Response = {
  recurringTransaction: RecurringTransaction;
};

@Injectable()
export class CreateRecurringTransactionService
  implements Service<CreateRecurringTransactionRequest, Errors, Response>
{
  constructor(
    private readonly recurringRepository: RecurringTransactionRepository,
    private readonly accountRepository: AccountRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute({
    workspaceId,
    accountId,
    categoryId,
    description,
    amount,
    frequency,
    interval,
    startDate,
    endDate,
    active,
  }: CreateRecurringTransactionRequest): Promise<Either<Errors, Response>> {
    // Validate amount
    if (amount <= 0) {
      return left(new InvalidAmountError());
    }

    // Validate account belongs to workspace
    const account = await this.accountRepository.findById(accountId);
    if (!account || account.workspaceId !== workspaceId) {
      return left(new UnauthorizedError());
    }

    // Validate category belongs to workspace if provided
    if (categoryId) {
      const category = await this.categoryRepository.findById(categoryId);
      if (!category || category.workspaceId !== workspaceId) {
        return left(new UnauthorizedError());
      }
    }

    // Create entity
    const recurring = new RecurringTransaction({
      workspaceId,
      accountId,
      categoryId: categoryId ?? null,
      description,
      amount: BigInt(Math.round(amount * 100)), // Convert to cents
      frequency: frequency as RecurrenceFrequency,
      interval: interval ?? 1,
      startDate,
      endDate: endDate ?? null,
      active: active ?? true,
      lastGenerated: null,
    });

    // Persist
    const created = await this.recurringRepository.create(recurring);

    return right({ recurringTransaction: created });
  }
}
