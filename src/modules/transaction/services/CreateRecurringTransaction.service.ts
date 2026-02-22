import { RecurrenceFrequency } from '@constants/enums';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { CategoryRepository } from '@modules/category/repositories/contracts/CategoryRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { CreateRecurringTransactionDTO } from '../dto/CreateRecurringTransactionDTO';
import { RecurringTransaction } from '../entities/RecurringTransaction';
import { InvalidRecurringTransactionError } from '../errors/InvalidRecurringTransactionError';
import { RecurringTransactionRepository } from '../repositories/contracts/RecurringTransactionRepository';

type Request = CreateRecurringTransactionDTO & TokenPayloadBase;

type Errors = UnauthorizedError | InvalidRecurringTransactionError;

type Response = {
  recurringTransaction: RecurringTransaction;
};

@Injectable()
export class CreateRecurringTransactionService
  implements Service<Request, Errors, Response>
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
    type,
    active,
  }: Request): Promise<Either<Errors, Response>> {
    const account = await this.accountRepository.findById(accountId);
    if (!account || account.workspaceId !== workspaceId) {
      return left(new UnauthorizedError());
    }

    const receivedDateString = startDate.toISOString().split('T')[0];
    const currentDateString = new Date().toISOString().split('T')[0];

    if (receivedDateString <= currentDateString) {
      return left(
        new InvalidRecurringTransactionError(
          'Transação recorrente não pode começar hoje ou no passado.',
        ),
      );
    }

    if (categoryId) {
      const category = await this.categoryRepository.findById(categoryId);

      const isGlobalCategory = !category?.workspaceId;
      const belongsToWorkspace = category?.workspaceId === workspaceId;

      if (!category || (!isGlobalCategory && !belongsToWorkspace)) {
        return left(new UnauthorizedError());
      }
    }

    const recurringOrError = RecurringTransaction.create({
      workspaceId,
      accountId,
      categoryId,
      description,
      amount,
      frequency: frequency as RecurrenceFrequency,
      interval,
      type,
      startDate,
      endDate,
      active,
    });

    if (recurringOrError.isLeft()) {
      return left(recurringOrError.value);
    }

    const recurring = recurringOrError.value;

    const created = await this.recurringRepository.create(recurring);

    return right({ recurringTransaction: created });
  }
}
