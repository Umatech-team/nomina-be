import { RecurrenceFrequency } from '@constants/enums';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { CategoryRepository } from '@modules/category/repositories/contracts/CategoryRepository';
import { RecurringTransaction } from '@modules/transaction/entities/RecurringTransaction';
import { RecurringTransactionRepository } from '@modules/transaction/repositories/contracts/RecurringTransactionRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { CreateRecurringTransactionRequest } from './create-recurring-transaction.dto';

type Request = CreateRecurringTransactionRequest & TokenPayloadBase;
type Errors = HttpException;
type Response = RecurringTransaction;

@Injectable()
export class CreateRecurringTransactionHandler
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
      return left(new HttpException('Unauthorized', 401));
    }

    const receivedDateString = startDate.toISOString().split('T')[0];
    const currentDateString = new Date().toISOString().split('T')[0];

    if (receivedDateString <= currentDateString) {
      return left(
        new HttpException(
          'Transaction cannot start today or in the past.',
          400,
        ),
      );
    }

    if (categoryId) {
      const category = await this.categoryRepository.findById(categoryId);

      const isGlobalCategory = !category?.workspaceId;
      const belongsToWorkspace = category?.workspaceId === workspaceId;

      if (!category || (!isGlobalCategory && !belongsToWorkspace)) {
        return left(new HttpException('Unauthorized', 401));
      }
    }

    const recurringOrError = RecurringTransaction.create({
      workspaceId,
      accountId,
      description,
      categoryId,
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

    return right(created);
  }
}
