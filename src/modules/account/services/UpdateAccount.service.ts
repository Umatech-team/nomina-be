import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UpdateAccountDTO } from '../dto/UpdateAccountDTO';
import { Account } from '../entities/Account';
import { AccountNotFoundError } from '../errors/AccountNotFoundError';
import { ConflictAccountError } from '../errors/ConflictAccountError';
import { InvalidAccountError } from '../errors/InvalidAccountError';
import { AccountRepository } from '../repositories/contracts/AccountRepository';

type Request = UpdateAccountDTO &
  Pick<TokenPayloadSchema, 'workspaceId'> & { accountId: string };
type Errors = AccountNotFoundError | ConflictAccountError | InvalidAccountError;
type Response = {
  account: Account;
};

@Injectable()
export class UpdateAccountService
  implements Service<Request, Errors, Response>
{
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute({
    accountId,
    name,
    workspaceId,
    type,
    icon,
    color,
    closingDay,
    dueDay,
  }: Request): Promise<Either<Errors, Response>> {
    const account = await this.accountRepository.findById(accountId);

    if (!account) {
      return left(
        new AccountNotFoundError('A conta especificada não foi encontrada.'),
      );
    }

    if (account.workspaceId !== workspaceId) {
      return left(
        new AccountNotFoundError(
          'Você não tem permissão para atualizar esta conta.',
        ),
      );
    }

    // Check for name conflicts if name changed
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
          new ConflictAccountError(
            'Já existe uma conta com esse nome no seu espaço.',
          ),
        );
      }
    }

    // Update account properties
    account.name = name;
    account.type = type;
    account.icon = icon;
    account.color = color;
    account.closingDay = closingDay;
    account.dueDay = dueDay;

    const updatedAccount = await this.accountRepository.update(account);

    return right({
      account: updatedAccount,
    });
  }
}
