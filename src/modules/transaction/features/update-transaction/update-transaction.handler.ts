import { Account } from '@modules/account/entities/Account';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { CategoryRepository } from '@modules/category/repositories/contracts/CategoryRepository';
import { Transaction } from '@modules/transaction/entities/Transaction';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { UpdateTransactionRequest } from './update-transaction.dto';

type Request = UpdateTransactionRequest & {
  transactionId: string;
} & TokenPayloadBase;
type Errors = HttpException;
type Response = Transaction;

@Injectable()
export class UpdateTransactionHandler implements Service<
  Request,
  Errors,
  Response
> {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute({
    workspaceId,
    transactionId,
    accountId,
    categoryId,
    title,
    description,
    amount,
    date,
    type,
    status,
    destinationAccountId,
  }: Request): Promise<Either<Errors, Response>> {
    const currentTransaction =
      await this.transactionRepository.findUniqueById(transactionId);

    if (!currentTransaction) {
      return left(new HttpException('Transaction not found', 404));
    }

    if (currentTransaction.workspaceId !== workspaceId) {
      return left(new HttpException('Unauthorized', 403));
    }

    const account = await this.accountRepository.findById(accountId);
    if (!account?.workspaceId || account.workspaceId !== workspaceId) {
      return left(new HttpException('Unauthorized', 403));
    }

    const categoryError = await this.validateCategory(categoryId, workspaceId);
    if (categoryError) return left(categoryError);

    const destError = await this.validateTransferDestination(
      type,
      destinationAccountId,
      accountId,
      workspaceId,
    );
    if (destError) return left(destError);

    const newTransactionOrError = Transaction.create(
      {
        workspaceId,
        accountId,
        categoryId,
        destinationAccountId: destinationAccountId ?? null,
        title,
        description: description ?? null,
        amount: BigInt(amount),
        date,
        type,
        status,
        recurringId: currentTransaction.recurringId,
        createdAt: currentTransaction.createdAt,
        updatedAt: new Date(),
      },
      transactionId,
    );

    if (newTransactionOrError.isLeft()) {
      return left(new HttpException(newTransactionOrError.value.message, 400));
    }

    const newTransaction = newTransactionOrError.value;

    const { sourceNewBalance, oldSourceAccountId, oldSourceNewBalance } =
      await this.calculateSourceBalances(
        account,
        currentTransaction,
        newTransaction,
      );

    const {
      destinationNewBalance,
      oldDestinationAccountId,
      oldDestinationNewBalance,
    } = await this.calculateDestinationBalances(
      currentTransaction,
      newTransaction,
    );

    await this.transactionRepository.updateWithBalanceUpdate(
      newTransaction,
      Number(sourceNewBalance),
      destinationNewBalance,
      oldDestinationNewBalance === undefined
        ? undefined
        : oldDestinationAccountId,
      oldDestinationNewBalance,
      oldSourceAccountId,
      oldSourceNewBalance,
    );

    return right(newTransaction);
  }

  private async validateCategory(
    categoryId: string,
    workspaceId: string,
  ): Promise<HttpException | null> {
    if (!categoryId) return null;

    const category = await this.categoryRepository.findById(categoryId);
    if (
      !category ||
      (category.workspaceId !== workspaceId && !category.isSystemCategory)
    ) {
      return new HttpException('Unauthorized', 403);
    }

    return null;
  }

  private async validateTransferDestination(
    type: string,
    destinationAccountId: string | undefined | null,
    accountId: string,
    workspaceId: string,
  ): Promise<HttpException | null> {
    if (type !== 'TRANSFER') return null;

    if (!destinationAccountId) {
      return new HttpException(
        'Conta destino é obrigatória para transferências',
        statusCode.BAD_REQUEST,
      );
    }
    if (destinationAccountId === accountId) {
      return new HttpException(
        'Conta destino deve ser diferente da conta origem',
        statusCode.BAD_REQUEST,
      );
    }
    const destAccount =
      await this.accountRepository.findById(destinationAccountId);
    if (!destAccount) {
      return new HttpException(
        'Conta destino não encontrada',
        statusCode.NOT_FOUND,
      );
    }
    if (destAccount.workspaceId !== workspaceId) {
      return new HttpException(
        'Conta destino não pertence ao workspace',
        statusCode.FORBIDDEN,
      );
    }

    return null;
  }

  private async calculateSourceBalances(
    account: Account,
    currentTransaction: Transaction,
    newTransaction: Transaction,
  ): Promise<{
    sourceNewBalance: bigint;
    oldSourceAccountId?: string;
    oldSourceNewBalance?: number;
  }> {
    const accountChanged =
      currentTransaction.accountId !== newTransaction.accountId;

    if (!accountChanged) {
      return {
        sourceNewBalance: this.calculateSourceBalance(
          account,
          currentTransaction,
          newTransaction,
        ),
      };
    }

    const oldAccount = await this.accountRepository.findById(
      currentTransaction.accountId,
    );

    let oldSourceAccountId: string | undefined;
    let oldSourceNewBalance: number | undefined;

    if (oldAccount) {
      let oldBalance = oldAccount.balance;
      if (
        currentTransaction.type === 'TRANSFER' ||
        currentTransaction.type === 'EXPENSE'
      ) {
        oldBalance += currentTransaction.amount;
      } else {
        oldBalance -= currentTransaction.amount;
      }
      oldSourceAccountId = currentTransaction.accountId;
      oldSourceNewBalance = Number(oldBalance);
    }

    let newBalance = account.balance;
    if (
      newTransaction.type === 'TRANSFER' ||
      newTransaction.type === 'EXPENSE'
    ) {
      newBalance -= newTransaction.amount;
    } else {
      newBalance += newTransaction.amount;
    }

    return {
      sourceNewBalance: newBalance,
      oldSourceAccountId,
      oldSourceNewBalance,
    };
  }

  private calculateSourceBalance(
    account: Account,
    currentTransaction: Transaction,
    newTransaction: Transaction,
  ): bigint {
    let sourceNewBalance = account.balance;

    // Revert old effect on source
    if (
      currentTransaction.type === 'TRANSFER' ||
      currentTransaction.type === 'EXPENSE'
    ) {
      sourceNewBalance += currentTransaction.amount;
    } else {
      sourceNewBalance -= currentTransaction.amount;
    }

    // Apply new effect on source
    if (
      newTransaction.type === 'TRANSFER' ||
      newTransaction.type === 'EXPENSE'
    ) {
      sourceNewBalance -= newTransaction.amount;
    } else {
      sourceNewBalance += newTransaction.amount;
    }

    return sourceNewBalance;
  }

  private async calculateDestinationBalances(
    currentTransaction: Transaction,
    newTransaction: Transaction,
  ): Promise<{
    destinationNewBalance: number | undefined;
    oldDestinationAccountId: string | null;
    oldDestinationNewBalance: number | undefined;
  }> {
    const oldDestId = currentTransaction.destinationAccountId;
    let oldDestNewBalance: number | undefined;

    // Revert old destination if was TRANSFER
    if (currentTransaction.type === 'TRANSFER' && oldDestId) {
      const oldDestAccount = await this.accountRepository.findById(oldDestId);
      if (oldDestAccount) {
        oldDestNewBalance = Number(
          oldDestAccount.balance - currentTransaction.amount,
        );
      }
    }

    let destNewBalance: number | undefined;

    // Apply new destination if new is TRANSFER
    if (
      newTransaction.type === 'TRANSFER' &&
      newTransaction.destinationAccountId
    ) {
      if (
        newTransaction.destinationAccountId === oldDestId &&
        oldDestNewBalance !== undefined
      ) {
        destNewBalance = oldDestNewBalance + Number(newTransaction.amount);
        oldDestNewBalance = undefined;
      } else {
        const newDestAccount = await this.accountRepository.findById(
          newTransaction.destinationAccountId,
        );
        if (newDestAccount) {
          destNewBalance = Number(
            newDestAccount.balance + newTransaction.amount,
          );
        }
      }
    }

    return {
      destinationNewBalance: destNewBalance,
      oldDestinationAccountId: oldDestId,
      oldDestinationNewBalance: oldDestNewBalance,
    };
  }
}
