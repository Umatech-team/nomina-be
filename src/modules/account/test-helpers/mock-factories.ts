import { AccountType } from '@constants/enums';
import { Account } from '@modules/account/entities/Account';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';

/**
 * Mock factory for AccountRepository
 */
export const createMockAccountRepository =
  (): jest.Mocked<AccountRepository> => ({
    create: jest.fn(),
    findByNameAndWorkspaceId: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findManyByWorkspaceId: jest.fn(),
    findAllByWorkspaceId: jest.fn(),
  });

/**
 * Mock factory for UserRepository (slim version for account tests)
 */
export const createMockUserRepository = (): jest.Mocked<
  Pick<UserRepository, 'findUniqueById' | 'findUniqueByEmail'>
> => ({
  findUniqueById: jest.fn(),
  findUniqueByEmail: jest.fn(),
});

interface CreateMockAccountOptions {
  id?: string;
  workspaceId?: string;
  name?: string;
  type?: AccountType;
  balance?: bigint;
  icon?: string | null;
  color?: string | null;
  closingDay?: number | null;
  dueDay?: number | null;
  creditLimit?: bigint | null;
}

/**
 * Factory that creates a valid Account entity for testing.
 * Uses `new Account()` directly (mapper pattern) since data is already validated.
 */
export const createMockAccount = (
  options: CreateMockAccountOptions = {},
): Account => {
  return new Account(
    {
      workspaceId: options.workspaceId ?? 'workspace-id-123',
      name: options.name ?? 'My Checking Account',
      type: options.type ?? AccountType.CHECKING,
      balance: options.balance ?? 0n,
      icon: options.icon ?? null,
      color: options.color ?? null,
      closingDay: options.closingDay ?? null,
      dueDay: options.dueDay ?? null,
      creditLimit: options.creditLimit ?? null,
    },
    options.id ?? 'account-id-123',
  );
};
