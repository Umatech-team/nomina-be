import { AnyAccount } from '@modules/account/entities/types';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { FindAccountRequest } from './find-account.dto';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';

type Request = FindAccountRequest & Pick<TokenPayloadSchema, 'workspaceId'>;

@Injectable()
export class FindAccountByIdService implements Service<
  Request,
  Error,
  AnyAccount
> {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute({
    accountId,
    workspaceId,
  }: Request): Promise<Either<Error, AnyAccount>> {
    const account = await this.accountRepository.findById(accountId);

    if (account?.workspaceId !== workspaceId) {
      return left(new UnauthorizedError());
    }

    return right(account);
  }
}
