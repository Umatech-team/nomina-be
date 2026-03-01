import { Account } from '@modules/account/entities/Account';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { CreateAccountRequest } from './create-account.dto';

type Request = CreateAccountRequest & TokenPayloadBase;
type Errors = HttpException;
type Response = Account;

@Injectable()
export class CreateAccountHandler
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
      return left(new HttpException('User not found', statusCode.NOT_FOUND));
    }

    const nameAccountAlreadyExists =
      await this.accountRepository.findByNameAndWorkspaceId(name, workspaceId);

    if (nameAccountAlreadyExists) {
      return left(
        new HttpException(
          "There's already an account with this name",
          statusCode.CONFLICT,
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
      return left(
        new HttpException(accountOrError.value.message, statusCode.BAD_REQUEST),
      );
    }

    const account = await this.accountRepository.create(accountOrError.value);

    return right(account);
  }
}
