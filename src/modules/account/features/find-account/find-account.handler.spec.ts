import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import {
  createMockAccount,
  createMockAccountRepository,
} from '@modules/account/test-helpers/mock-factories';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FindAccountByIdHandler } from './find-account.handler';

const WORKSPACE_ID = 'workspace-id-abc';
const ACCOUNT_ID = '123e4567-e89b-12d3-a456-426614174000';

const makeRequest = (
  overrides: { accountId?: string; workspaceId?: string } = {},
) => ({
  accountId: overrides.accountId ?? ACCOUNT_ID,
  workspaceId: overrides.workspaceId ?? WORKSPACE_ID,
});

describe('FindAccountByIdHandler', () => {
  let handler: FindAccountByIdHandler;
  let accountRepository: jest.Mocked<AccountRepository>;

  beforeEach(async () => {
    accountRepository = createMockAccountRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAccountByIdHandler,
        { provide: AccountRepository, useValue: accountRepository },
      ],
    }).compile();

    handler = module.get<FindAccountByIdHandler>(FindAccountByIdHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute – Success Cases', () => {
    it('should return Right(Account) when account exists and belongs to workspace', async () => {
      const account = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
      });
      accountRepository.findById.mockResolvedValue(account);

      const result = await handler.execute(makeRequest());

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.id).toBe(ACCOUNT_ID);
        expect(result.value.workspaceId).toBe(WORKSPACE_ID);
      }
    });

    it('should call accountRepository.findById with the correct accountId', async () => {
      const account = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
      });
      accountRepository.findById.mockResolvedValue(account);

      await handler.execute(makeRequest());

      expect(accountRepository.findById).toHaveBeenCalledWith(ACCOUNT_ID);
      expect(accountRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should return the account entity with all its properties', async () => {
      const account = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
        name: 'My Savings',
        balance: 5000n,
        icon: 'piggy',
        color: '#00FF00',
      });
      accountRepository.findById.mockResolvedValue(account);

      const result = await handler.execute(makeRequest());

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.name).toBe('My Savings');
        expect(result.value.balance).toBe(5000n);
        expect(result.value.icon).toBe('piggy');
        expect(result.value.color).toBe('#00FF00');
      }
    });
  });

  describe('execute – Account Not Found', () => {
    it('should return Left(404) when account does not exist', async () => {
      accountRepository.findById.mockResolvedValue(null);

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('execute – Workspace Ownership', () => {
    it('should return Left(404) when account belongs to a different workspace', async () => {
      const account = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: 'other-workspace-id',
      });
      accountRepository.findById.mockResolvedValue(account);

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should not leak workspace data: returns 404 for cross-workspace access', async () => {
      const account = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: 'attacker-workspace',
      });
      accountRepository.findById.mockResolvedValue(account);

      const result = await handler.execute(
        makeRequest({ workspaceId: 'legitimate-workspace' }),
      );

      // Should return 404, NOT the account data
      expect(result.isLeft()).toBe(true);
      expect(result.isRight()).toBe(false);
    });
  });
});
