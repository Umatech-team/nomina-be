import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import {
  createMockAccount,
  createMockAccountRepository,
} from '@modules/account/test-helpers/mock-factories';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeleteAccountHandler } from './delete-account.handler';

const WORKSPACE_ID = 'workspace-id-abc';
const ACCOUNT_ID = '123e4567-e89b-12d3-a456-426614174000';

const makeRequest = (
  overrides: { accountId?: string; workspaceId?: string } = {},
) => ({
  accountId: overrides.accountId ?? ACCOUNT_ID,
  workspaceId: overrides.workspaceId ?? WORKSPACE_ID,
});

describe('DeleteAccountHandler', () => {
  let handler: DeleteAccountHandler;
  let accountRepository: jest.Mocked<AccountRepository>;

  beforeEach(async () => {
    accountRepository = createMockAccountRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAccountHandler,
        { provide: AccountRepository, useValue: accountRepository },
      ],
    }).compile();

    handler = module.get<DeleteAccountHandler>(DeleteAccountHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute – Success Cases', () => {
    it('should delete account and return Right(null)', async () => {
      const account = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
      });
      accountRepository.findById.mockResolvedValue(account);
      accountRepository.delete.mockResolvedValue(undefined);

      const result = await handler.execute(makeRequest());

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toBeNull();
      }
    });

    it('should call accountRepository.delete with correct accountId', async () => {
      const account = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
      });
      accountRepository.findById.mockResolvedValue(account);
      accountRepository.delete.mockResolvedValue(undefined);

      await handler.execute(makeRequest());

      expect(accountRepository.delete).toHaveBeenCalledWith(ACCOUNT_ID);
      expect(accountRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should look up account by accountId before deleting', async () => {
      const account = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
      });
      accountRepository.findById.mockResolvedValue(account);
      accountRepository.delete.mockResolvedValue(undefined);

      await handler.execute(makeRequest());

      expect(accountRepository.findById).toHaveBeenCalledWith(ACCOUNT_ID);
    });
  });

  describe('execute – Account Not Found', () => {
    it('should return Left(403) when account does not exist', async () => {
      accountRepository.findById.mockResolvedValue(null);

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect((result.value as HttpException).getStatus()).toBe(
          HttpStatus.FORBIDDEN,
        );
      }
    });

    it('should not call delete when account is not found', async () => {
      accountRepository.findById.mockResolvedValue(null);

      await handler.execute(makeRequest());

      expect(accountRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('execute – Workspace Ownership', () => {
    it('should return Left(403) when account belongs to a different workspace', async () => {
      const account = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: 'other-workspace-id',
      });
      accountRepository.findById.mockResolvedValue(account);

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect((result.value as HttpException).getStatus()).toBe(
          HttpStatus.FORBIDDEN,
        );
      }
    });

    it('should not call delete when workspace does not match', async () => {
      const account = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: 'other-workspace-id',
      });
      accountRepository.findById.mockResolvedValue(account);

      await handler.execute(makeRequest());

      expect(accountRepository.delete).not.toHaveBeenCalled();
    });
  });
});
