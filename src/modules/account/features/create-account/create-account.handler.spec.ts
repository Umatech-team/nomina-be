import { AccountType } from '@constants/enums';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import {
  createMockAccount,
  createMockAccountRepository,
  createMockUserRepository,
} from '@modules/account/test-helpers/mock-factories';
import { User } from '@modules/user/entities/User';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateAccountRequest } from './create-account.dto';
import { CreateAccountHandler } from './create-account.handler';

const WORKSPACE_ID = 'workspace-id-abc';
const USER_ID = 'user-id-abc';

const makeRequest = (
  overrides: Partial<
    CreateAccountRequest & { workspaceId: string; sub: string }
  > = {},
): CreateAccountRequest & { workspaceId: string; sub: string } => ({
  name: 'My Checking',
  type: AccountType.CHECKING,
  icon: null,
  color: null,
  closingDay: null,
  dueDay: null,
  workspaceId: WORKSPACE_ID,
  sub: USER_ID,
  ...overrides,
});

describe('CreateAccountHandler', () => {
  let handler: CreateAccountHandler;
  let accountRepository: jest.Mocked<AccountRepository>;
  let userRepository: ReturnType<typeof createMockUserRepository>;

  beforeEach(async () => {
    accountRepository = createMockAccountRepository();
    userRepository = createMockUserRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAccountHandler,
        { provide: AccountRepository, useValue: accountRepository },
        { provide: UserRepository, useValue: userRepository },
      ],
    }).compile();

    handler = module.get<CreateAccountHandler>(CreateAccountHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute – Success Cases', () => {
    it('should create account and return Right(Account)', async () => {
      const mockUser = { id: USER_ID } as User;
      const mockAccount = createMockAccount({
        workspaceId: WORKSPACE_ID,
        name: 'My Checking',
      });
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      accountRepository.findByNameAndWorkspaceId.mockResolvedValue(null);
      accountRepository.create.mockResolvedValue(mockAccount);

      const result = await handler.execute(makeRequest());

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.name).toBe('My Checking');
        expect(result.value.workspaceId).toBe(WORKSPACE_ID);
      }
    });

    it('should call accountRepository.create with balance set to 0n', async () => {
      const mockUser = { id: USER_ID } as User;
      const mockAccount = createMockAccount();
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      accountRepository.findByNameAndWorkspaceId.mockResolvedValue(null);
      accountRepository.create.mockResolvedValue(mockAccount);

      await handler.execute(makeRequest());

      const createdArg = accountRepository.create.mock.calls[0][0];
      expect(createdArg.balance).toBe(0n);
    });

    it('should call userRepository.findUniqueById with the sub from token', async () => {
      const mockUser = { id: USER_ID } as User;
      const mockAccount = createMockAccount();
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      accountRepository.findByNameAndWorkspaceId.mockResolvedValue(null);
      accountRepository.create.mockResolvedValue(mockAccount);

      await handler.execute(makeRequest({ sub: USER_ID }));

      expect(userRepository.findUniqueById).toHaveBeenCalledWith(USER_ID);
    });

    it('should check name uniqueness within the workspace', async () => {
      const mockUser = { id: USER_ID } as User;
      const mockAccount = createMockAccount();
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      accountRepository.findByNameAndWorkspaceId.mockResolvedValue(null);
      accountRepository.create.mockResolvedValue(mockAccount);

      await handler.execute(makeRequest({ name: 'Unique Name' }));

      expect(accountRepository.findByNameAndWorkspaceId).toHaveBeenCalledWith(
        'Unique Name',
        WORKSPACE_ID,
      );
    });

    it('should accept optional fields (icon, color, closingDay, dueDay) as null', async () => {
      const mockUser = { id: USER_ID } as User;
      const mockAccount = createMockAccount({
        icon: null,
        color: null,
        closingDay: null,
        dueDay: null,
      });
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      accountRepository.findByNameAndWorkspaceId.mockResolvedValue(null);
      accountRepository.create.mockResolvedValue(mockAccount);

      const result = await handler.execute(makeRequest());

      expect(result.isRight()).toBe(true);
    });

    it('should create account with optional fields provided', async () => {
      const mockUser = { id: USER_ID } as User;
      const mockAccount = createMockAccount({
        icon: 'card',
        color: '#FF5733',
        closingDay: 5,
        dueDay: 15,
      });
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      accountRepository.findByNameAndWorkspaceId.mockResolvedValue(null);
      accountRepository.create.mockResolvedValue(mockAccount);

      const result = await handler.execute(
        makeRequest({
          icon: 'card',
          color: '#FF5733',
          closingDay: 5,
          dueDay: 15,
        }),
      );

      expect(result.isRight()).toBe(true);
    });
  });

  describe('execute – User Not Found', () => {
    it('should return Left(404) when user does not exist', async () => {
      userRepository.findUniqueById.mockResolvedValue(null);

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(HttpException);
        expect(result.value.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should not check name or create account when user is not found', async () => {
      userRepository.findUniqueById.mockResolvedValue(null);

      await handler.execute(makeRequest());

      expect(accountRepository.findByNameAndWorkspaceId).not.toHaveBeenCalled();
      expect(accountRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('execute – Name Conflict', () => {
    it('should return Left(409) when account with same name exists in workspace', async () => {
      const mockUser = { id: USER_ID } as User;
      const existing = createMockAccount({ name: 'My Checking' });
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      accountRepository.findByNameAndWorkspaceId.mockResolvedValue(existing);

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.getStatus()).toBe(HttpStatus.CONFLICT);
      }
    });

    it('should not call accountRepository.create when name is taken', async () => {
      const mockUser = { id: USER_ID } as User;
      const existing = createMockAccount({ name: 'My Checking' });
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      accountRepository.findByNameAndWorkspaceId.mockResolvedValue(existing);

      await handler.execute(makeRequest());

      expect(accountRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('execute – Account.create validation errors', () => {
    it('should return Left(400) when workspaceId is missing', async () => {
      const mockUser = { id: USER_ID } as User;
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      accountRepository.findByNameAndWorkspaceId.mockResolvedValue(null);

      const result = await handler.execute(makeRequest({ workspaceId: '' }));

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should return Left(400) when name is too short (less than 2 chars for entity)', async () => {
      const mockUser = { id: USER_ID } as User;
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      accountRepository.findByNameAndWorkspaceId.mockResolvedValue(null);

      // Account entity validates name length 2-50
      const result = await handler.execute(makeRequest({ name: 'A' }));

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });
});
