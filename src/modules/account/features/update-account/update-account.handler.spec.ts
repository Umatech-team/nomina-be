import { AccountType } from '@constants/enums';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import {
  createMockAccount,
  createMockAccountRepository,
} from '@modules/account/test-helpers/mock-factories';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateAccountRequest } from './update-account.dto';
import { UpdateAccountHandler } from './update-account.handler';

const WORKSPACE_ID = 'workspace-id-abc';
const ACCOUNT_ID = '123e4567-e89b-12d3-a456-426614174000';

const makeRequest = (
  overrides: Partial<UpdateAccountRequest> & {
    workspaceId?: string;
    accountId?: string;
  } = {},
): UpdateAccountRequest & { workspaceId: string; accountId: string } => ({
  accountId: ACCOUNT_ID,
  name: 'Updated Name',
  type: AccountType.CHECKING,
  closingDay: null,
  dueDay: null,
  workspaceId: WORKSPACE_ID,
  ...overrides,
});

describe('UpdateAccountHandler', () => {
  let handler: UpdateAccountHandler;
  let accountRepository: jest.Mocked<AccountRepository>;

  beforeEach(async () => {
    accountRepository = createMockAccountRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAccountHandler,
        { provide: AccountRepository, useValue: accountRepository },
      ],
    }).compile();

    handler = module.get<UpdateAccountHandler>(UpdateAccountHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute – Success Cases', () => {
    it('should update account and return Right(Account)', async () => {
      const existing = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
        name: 'Old Name',
      });
      const updated = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
        name: 'Updated Name',
      });
      accountRepository.findById.mockResolvedValue(existing);
      accountRepository.findByNameAndWorkspaceId.mockResolvedValue(null);
      accountRepository.update.mockResolvedValue(updated);

      const result = await handler.execute(makeRequest());

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.name).toBe('Updated Name');
      }
    });

    it('should mutate entity fields before calling repository.update', async () => {
      const existing = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
        name: 'Old Name',
        type: AccountType.CHECKING,
      });
      const updated = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
        name: 'New Name',
        type: AccountType.INVESTMENT,
        icon: 'chart',
        color: '#123456',
        closingDay: 5,
        dueDay: 10,
      });
      accountRepository.findById.mockResolvedValue(existing);
      accountRepository.findByNameAndWorkspaceId.mockResolvedValue(null);
      accountRepository.update.mockResolvedValue(updated);

      const result = await handler.execute(
        makeRequest({
          accountId: ACCOUNT_ID,
          name: 'New Name',
          type: AccountType.INVESTMENT,
          closingDay: 5,
          dueDay: 10,
        }),
      );

      expect(result.isRight()).toBe(true);
      expect(accountRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should skip name-conflict check when name has not changed', async () => {
      const existing = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
        name: 'Same Name',
      });
      accountRepository.findById.mockResolvedValue(existing);
      accountRepository.update.mockResolvedValue(existing);

      await handler.execute(makeRequest({ name: 'Same Name' }));

      expect(accountRepository.findByNameAndWorkspaceId).not.toHaveBeenCalled();
    });

    it('should allow rename when only another account has the same name (not the current one)', async () => {
      const existing = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
        name: 'Old Name',
      });
      accountRepository.findById.mockResolvedValue(existing);
      accountRepository.findByNameAndWorkspaceId.mockResolvedValue(existing);
      accountRepository.update.mockResolvedValue(
        createMockAccount({ id: ACCOUNT_ID, name: 'Old Name' }),
      );

      const result = await handler.execute(
        makeRequest({ name: 'New Unique Name' }),
      );

      expect(result.isRight()).toBe(true);
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

    it('should not call update when account is not found', async () => {
      accountRepository.findById.mockResolvedValue(null);

      await handler.execute(makeRequest());

      expect(accountRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('execute – Workspace Ownership', () => {
    it('should return Left(403) when account belongs to different workspace', async () => {
      const existing = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: 'other-workspace-id',
        name: 'Some Account',
      });
      accountRepository.findById.mockResolvedValue(existing);

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.getStatus()).toBe(HttpStatus.FORBIDDEN);
      }
    });
  });

  describe('execute – Name Conflict', () => {
    it('should return Left(409) when new name already belongs to another account', async () => {
      const existing = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
        name: 'Old Name',
      });
      const conflict = createMockAccount({
        id: 'other-account-id',
        workspaceId: WORKSPACE_ID,
        name: 'Updated Name',
      });
      accountRepository.findById.mockResolvedValue(existing);
      accountRepository.findByNameAndWorkspaceId.mockResolvedValue(conflict);

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.getStatus()).toBe(HttpStatus.CONFLICT);
      }
    });

    it('should not call repository.update when name conflict is detected', async () => {
      const existing = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
        name: 'Old Name',
      });
      const conflict = createMockAccount({
        id: 'other-account-id',
        workspaceId: WORKSPACE_ID,
        name: 'Updated Name',
      });
      accountRepository.findById.mockResolvedValue(existing);
      accountRepository.findByNameAndWorkspaceId.mockResolvedValue(conflict);

      await handler.execute(makeRequest());

      expect(accountRepository.update).not.toHaveBeenCalled();
    });
  });
});
