import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { CreateAccountDTO } from '../dto/CreateAccountDTO';
import { Account } from '../entities/Account';
import { ConflictAccountError } from '../errors/ConflictAccountError';
import { AccountRepository } from '../repositories/contracts/AccountRepository';

type Request = CreateAccountDTO & Pick<TokenPayloadSchema, 'sub'>;
type Errors = ConflictAccountError;
type Response = {
  account: Account;
};

@Injectable()
export class CreateAccountService
  implements Service<Request, Errors, Response>
{
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute({
    name,
    sub,
    type,
    icon,
    color,
    closingDay,
    dueDay,
  }: Request): Promise<Either<Errors, Response>> {
    const nameAccountAlreadyExists =
      await this.accountRepository.findByNameAndWorkspaceId(name, sub);

    if (nameAccountAlreadyExists) {
      return left(
        new ConflictAccountError(
          'Já existe uma conta com esse nome no seu espaço.',
        ),
      );
    }

    const accountOrError = Account.create({
      workspaceId: sub,
      name,
      type,
      balance: 0n,
      icon,
      color,
      closingDay,
      dueDay,
    });

    if (accountOrError.isLeft()) {
      return left(accountOrError.value);
    }

    const account = await this.accountRepository.create(accountOrError.value);
    return right({
      account,
    });
  }
}
