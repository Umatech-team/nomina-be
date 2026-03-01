import { Account } from '@modules/account/entities/Account';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, right } from '@shared/core/errors/Either';
import { ListAccountsRequest } from './list-accounts.dto';

type Request = ListAccountsRequest & Pick<TokenPayloadSchema, 'workspaceId'>;
type Errors = never;
type Response = {
  accounts: Account[];
  total: number;
};

@Injectable()
export class ListAccountsHandler implements Service<Request, Errors, Response> {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute({
    page,
    pageSize,
    workspaceId,
  }: Request): Promise<Either<Errors, Response>> {
    const { accounts, total } =
      await this.accountRepository.findManyByWorkspaceId(
        workspaceId,
        page,
        pageSize,
      );

    return right({
      accounts,
      total,
    });
  }
}
