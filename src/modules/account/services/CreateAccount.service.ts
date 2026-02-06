import { UserRepository } from '@modules/user/repositories/contracts/UserRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { CreateAccountDTO } from '../dto/CreateAccountDTO';
import { Account } from '../entities/Account';
import { ConflictAccountError } from '../errors/ConflictAccountError';
import { AccountRepository } from '../repositories/contracts/AccountRepository';

type Request = CreateAccountDTO & TokenPayloadBase;
type Errors = ConflictAccountError;
type Response = {
  account: Account;
};

@Injectable()
export class CreateAccountService
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({
    name,
    workspaceId,
    type,
    icon,
    color,
    closingDay,
    dueDay,
    sub,
  }: Request): Promise<Either<Errors, Response>> {
    const user = await this.userRepository.findUniqueById(sub);

    if (!user) {
      return left(new UnauthorizedError());
    }

    const nameAccountAlreadyExists =
      await this.accountRepository.findByNameAndWorkspaceId(name, workspaceId);

    if (nameAccountAlreadyExists) {
      return left(
        new ConflictAccountError(
          'Já existe uma conta com esse nome no seu espaço.',
        ),
      );
    }

    const accountOrError = Account.create({
      workspaceId,
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
