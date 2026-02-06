import { Account } from '@modules/account/entities/Account';

export abstract class AccountRepository {
  abstract create(account: Account): Promise<Account>;
  abstract findByNameAndWorkspaceId(
    name: string,
    workspaceId: string,
  ): Promise<Account | null>;

  abstract findById(accountId: string): Promise<Account | null>;
  abstract update(account: Account): Promise<Account>;
  abstract delete(accountId: string): Promise<void>;
  abstract findManyByWorkspaceId(
    workspaceId: string,
    page: number,
    pageSize: number,
  ): Promise<{ accounts: Account[]; total: number }>;

  abstract findAllByWorkspaceId(workspaceId: string): Promise<Account[]>;
}
