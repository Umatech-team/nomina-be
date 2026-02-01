import { Account } from '@modules/account/entities/Account';

export abstract class AccountRepository {
  abstract create(account: Account): Promise<Account>;
  abstract findByNameAndWorkspaceId(
    name: string,
    workspaceId: string,
  ): Promise<Account | null>;
}
