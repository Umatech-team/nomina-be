import { Account } from '@modules/account/entities/Account';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { MoneyUtils } from '@utils/MoneyUtils';
import { UpdateAccountRequest } from './update-account.dto';

type Request = UpdateAccountRequest & { accountId: string } & Pick<
    TokenPayloadSchema,
    'workspaceId'
  >;
type Errors = HttpException;
type Response = Account;

@Injectable()
export class UpdateAccountHandler implements Service<
  Request,
  Errors,
  Response
> {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute({
    accountId,
    name,
    workspaceId,
    type,
    closingDay,
    dueDay,
    creditLimit,
  }: Request): Promise<Either<Errors, Response>> {
    const account = await this.accountRepository.findById(accountId);

    if (!account) {
      return left(new HttpException('Account not found', statusCode.NOT_FOUND));
    }

    if (account.workspaceId !== workspaceId) {
      return left(
        new HttpException(
          'You have no permission to update this account or it does not exist',
          statusCode.FORBIDDEN,
        ),
      );
    }

    if (account.name !== name) {
      const nameAccountAlreadyExists =
        await this.accountRepository.findByNameAndWorkspaceId(
          name,
          workspaceId,
        );

      if (
        nameAccountAlreadyExists &&
        nameAccountAlreadyExists.id !== accountId
      ) {
        return left(
          new HttpException(
            'An account with this name already exists in the workspace',
            statusCode.CONFLICT,
          ),
        );
      }
    }

    account.name = name;
    account.type = type;
    account.closingDay = closingDay;
    account.dueDay = dueDay;

    if (creditLimit !== undefined) {
      account.creditLimit =
        creditLimit === null
          ? null
          : BigInt(MoneyUtils.decimalToCents(creditLimit));
    }

    const updatedAccount = await this.accountRepository.update(account);

    return right(updatedAccount);
  }
}
