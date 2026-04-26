import { RecurrenceFrequency } from '@constants/enums';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { CategoryRepository } from '@modules/category/repositories/contracts/CategoryRepository';
import { RecurringTransaction } from '@modules/transaction/entities/RecurringTransaction';
import {
  RecurringTransactionNotFoundError,
  StartDateCannotBeTodayOrPastError,
} from '@modules/transaction/errors';
import { RecurringTransactionRepository } from '@modules/transaction/repositories/contracts/RecurringTransactionRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { DateProvider } from '@providers/date/contracts/DateProvider';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { CreateRecurringTransactionRequest } from './create-recurring-transaction.dto';

type Request = CreateRecurringTransactionRequest & TokenPayloadBase;

@Injectable()
export class CreateRecurringTransactionService implements Service<
  Request,
  Error,
  RecurringTransaction
> {
  constructor(
    private readonly recurringRepository: RecurringTransactionRepository,
    private readonly accountRepository: AccountRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly dateProvider: DateProvider,
  ) {}

  async execute(
    request: Request,
  ): Promise<Either<Error, RecurringTransaction>> {
    const {
      workspaceId,
      accountId,
      categoryId,
      destinationAccountId,
      startDate,
      endDate,
    } = request;

    const account = await this.accountRepository.findById(accountId);
    if (account?.workspaceId !== workspaceId) {
      return left(new UnauthorizedError());
    }

    if (destinationAccountId) {
      const destAccount =
        await this.accountRepository.findById(destinationAccountId);
      if (destAccount?.workspaceId !== workspaceId) {
        return left(new UnauthorizedError());
      }
    }

    if (categoryId) {
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) return left(new RecurringTransactionNotFoundError());

      const isGlobalCategory = !category.workspaceId;
      const belongsToWorkspace = category.workspaceId === workspaceId;

      if (!isGlobalCategory && !belongsToWorkspace) {
        return left(
          new UnauthorizedError('Você não tem acesso a esta categoria.'),
        );
      }
    }

    const accountTz = account.timezone;

    const start = this.dateProvider.startOfDay(startDate, accountTz);
    const end = endDate
      ? this.dateProvider.startOfDay(endDate, accountTz)
      : null;

    const today = this.dateProvider.startOfDay(
      this.dateProvider.now(),
      accountTz,
    );

    if (start <= today) {
      return left(new StartDateCannotBeTodayOrPastError());
    }

    const recurringOrError = RecurringTransaction.create({
      workspaceId,
      accountId,
      destinationAccountId: destinationAccountId ?? null,
      title: request.title,
      description: request.description ?? null,
      categoryId,
      amount: request.amount,
      frequency: request.frequency as RecurrenceFrequency,
      interval: request.interval,
      type: request.type,
      startDate: start,
      endDate: end,
      active: request.active,
    });

    if (recurringOrError.isLeft()) {
      return left(recurringOrError.value);
    }

    const created = await this.recurringRepository.create(
      recurringOrError.value,
    );
    return right(created);
  }
}
