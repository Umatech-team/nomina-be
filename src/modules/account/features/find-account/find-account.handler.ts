import { Account } from '@modules/account/entities/Account';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { FindAccountRequest } from './find-account.dto';

type Request = FindAccountRequest & Pick<TokenPayloadSchema, 'workspaceId'>;
type Errors = HttpException;
type Response = Account;

@Injectable()
export class FindAccountByIdHandler
  implements Service<Request, Errors, Response>
{
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute({
    accountId,
    workspaceId,
  }: Request): Promise<Either<Errors, Response>> {
    const account = await this.accountRepository.findById(accountId);

    if (!account || account.workspaceId !== workspaceId) {
      return left(new HttpException('account not found', statusCode.NOT_FOUND));
    }

    return right(account);
  }
}
