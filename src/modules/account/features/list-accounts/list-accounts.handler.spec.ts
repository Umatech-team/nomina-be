import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import {
  createMockAccount,
  createMockAccountRepository,
} from '@modules/account/test-helpers/mock-factories';
import { Test, TestingModule } from '@nestjs/testing';
import { ListAccountsHandler } from './list-accounts.handler';

const WORKSPACE_ID = 'workspace-id-abc';

const makeRequest = (
  overrides: {
    page?: number;
    pageSize?: number;
    workspaceId?: string;
  } = {},
) => ({
  page: overrides.page ?? 1,
  pageSize: overrides.pageSize ?? 10,
  workspaceId: overrides.workspaceId ?? WORKSPACE_ID,
});

describe('ListAccountsHandler', () => {
  let handler: ListAccountsHandler;
  let accountRepository: jest.Mocked<AccountRepository>;

  beforeEach(async () => {
    accountRepository = createMockAccountRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListAccountsHandler,
        { provide: AccountRepository, useValue: accountRepository },
      ],
    }).compile();

    handler = module.get<ListAccountsHandler>(ListAccountsHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute – Success Cases', () => {
    it('should return Right with accounts array and total count', async () => {
      const accounts = [
        createMockAccount({ id: 'acc-1', workspaceId: WORKSPACE_ID }),
        createMockAccount({ id: 'acc-2', workspaceId: WORKSPACE_ID }),
      ];
      accountRepository.findManyByWorkspaceId.mockResolvedValue({
        accounts,
        total: 2,
      });

      const result = await handler.execute(makeRequest());

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.accounts).toHaveLength(2);
        expect(result.value.total).toBe(2);
      }
    });

    it('should return Right with empty accounts and total=0 when workspace has no accounts', async () => {
      accountRepository.findManyByWorkspaceId.mockResolvedValue({
        accounts: [],
        total: 0,
      });

      const result = await handler.execute(makeRequest());

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.accounts).toHaveLength(0);
        expect(result.value.total).toBe(0);
      }
    });

    it('should call findManyByWorkspaceId with correct workspaceId, page and pageSize', async () => {
      accountRepository.findManyByWorkspaceId.mockResolvedValue({
        accounts: [],
        total: 0,
      });

      await handler.execute(makeRequest({ page: 2, pageSize: 20 }));

      expect(accountRepository.findManyByWorkspaceId).toHaveBeenCalledWith(
        WORKSPACE_ID,
        2,
        20,
      );
    });

    it('should call findManyByWorkspaceId exactly once', async () => {
      accountRepository.findManyByWorkspaceId.mockResolvedValue({
        accounts: [],
        total: 0,
      });

      await handler.execute(makeRequest());

      expect(accountRepository.findManyByWorkspaceId).toHaveBeenCalledTimes(1);
    });

    it('should use the workspaceId from the request (not a hardcoded value)', async () => {
      accountRepository.findManyByWorkspaceId.mockResolvedValue({
        accounts: [],
        total: 0,
      });

      await handler.execute(makeRequest({ workspaceId: 'custom-workspace' }));

      expect(accountRepository.findManyByWorkspaceId).toHaveBeenCalledWith(
        'custom-workspace',
        expect.any(Number),
        expect.any(Number),
      );
    });

    it('should support pagination with page=1 and pageSize=50', async () => {
      const accounts = Array.from({ length: 50 }, (_, i) =>
        createMockAccount({ id: `acc-${i}`, workspaceId: WORKSPACE_ID }),
      );
      accountRepository.findManyByWorkspaceId.mockResolvedValue({
        accounts,
        total: 50,
      });

      const result = await handler.execute(
        makeRequest({ page: 1, pageSize: 50 }),
      );

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.accounts).toHaveLength(50);
        expect(result.value.total).toBe(50);
      }
    });

    it('should return total that can be greater than the current page count', async () => {
      const accounts = [
        createMockAccount({ id: 'acc-1', workspaceId: WORKSPACE_ID }),
      ];
      accountRepository.findManyByWorkspaceId.mockResolvedValue({
        accounts,
        total: 100,
      });

      const result = await handler.execute(
        makeRequest({ page: 5, pageSize: 1 }),
      );

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.accounts).toHaveLength(1);
        expect(result.value.total).toBe(100);
      }
    });
  });
});
