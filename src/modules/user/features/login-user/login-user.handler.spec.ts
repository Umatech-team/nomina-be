import { RefreshTokensRepository } from '@modules/user/repositories/contracts/refresh-token.repository';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import {
  createMockDateAddition,
  createMockDefaultWorkspaceResult,
  createMockEncrypter,
  createMockHashComparer,
  createMockRefreshTokensRepository,
  createMockUser,
  createMockUserRepository,
  createMockWorkspaceUserRepository,
} from '@modules/user/test-helpers/mock-factories';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Encrypter } from '@providers/cryptography/contracts/Encrypter';
import { HashComparer } from '@providers/cryptography/contracts/HashComparer';
import { DateAddition } from '@providers/date/contracts/DateAddition';
import { LoginUserRequest } from './login-user.dto';
import { LoginUserHandler } from './login-user.handler';

describe('LoginUserHandler', () => {
  let handler: LoginUserHandler;
  let userRepository: jest.Mocked<UserRepository>;
  let workspaceUserRepository: jest.Mocked<WorkspaceUserRepository>;
  let refreshTokensRepository: jest.Mocked<RefreshTokensRepository>;
  let hashComparer: jest.Mocked<HashComparer>;
  let encrypter: jest.Mocked<Encrypter>;
  let dateAddition: jest.Mocked<DateAddition>;

  const mockUser = createMockUser();
  const mockWorkspaceResult = createMockDefaultWorkspaceResult();

  const makeRequest = (
    overrides?: Partial<LoginUserRequest>,
  ): LoginUserRequest => ({
    email: 'john@example.com',
    password: 'password123',
    ...overrides,
  });

  const arrangeSuccessMocks = () => {
    userRepository.findUniqueByEmail.mockResolvedValue(mockUser);
    hashComparer.compare.mockResolvedValue(true);
    workspaceUserRepository.findDefaultWorkspaceByUserId.mockResolvedValue(
      mockWorkspaceResult,
    );
    encrypter.encrypt
      .mockResolvedValueOnce('access_token_abc')
      .mockResolvedValueOnce('refresh_token_xyz');
    dateAddition.addDaysInCurrentDate.mockReturnValue(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );
    refreshTokensRepository.deleteManyByUserId.mockResolvedValue(undefined);
    refreshTokensRepository.create.mockResolvedValue(undefined);
  };

  beforeEach(async () => {
    userRepository = createMockUserRepository();
    workspaceUserRepository = createMockWorkspaceUserRepository();
    refreshTokensRepository = createMockRefreshTokensRepository();
    hashComparer = createMockHashComparer();
    encrypter = createMockEncrypter();
    dateAddition = createMockDateAddition();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserHandler,
        { provide: UserRepository, useValue: userRepository },
        { provide: WorkspaceUserRepository, useValue: workspaceUserRepository },
        { provide: RefreshTokensRepository, useValue: refreshTokensRepository },
        { provide: HashComparer, useValue: hashComparer },
        { provide: Encrypter, useValue: encrypter },
        { provide: DateAddition, useValue: dateAddition },
      ],
    }).compile();

    handler = module.get<LoginUserHandler>(LoginUserHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute()', () => {
    it('should orchestrate login flow and return tokens on success (Right)', async () => {
      const request = makeRequest();
      arrangeSuccessMocks();
      const result = await handler.execute(request);
      expect(userRepository.findUniqueByEmail).toHaveBeenCalledWith(
        request.email,
      );
      expect(hashComparer.compare).toHaveBeenCalledWith(
        request.password,
        mockUser.passwordHash,
      );
      expect(
        workspaceUserRepository.findDefaultWorkspaceByUserId,
      ).toHaveBeenCalledWith(mockUser.id);
      expect(encrypter.encrypt).toHaveBeenCalledTimes(2);
      expect(refreshTokensRepository.deleteManyByUserId).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(refreshTokensRepository.create).toHaveBeenCalled();

      expect(result.isRight()).toBe(true);
      const tokens = result.value as {
        accessToken: string;
        refreshToken: string;
      };
      expect(tokens.accessToken).toBe('access_token_abc');
      expect(tokens.refreshToken).toBe('refresh_token_xyz');
    });

    it('should return Unauthorized (401) when email is not found', async () => {
      arrangeSuccessMocks();
      userRepository.findUniqueByEmail.mockResolvedValue(null);

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      expect((result.value as HttpException).getStatus()).toBe(401);
      expect(hashComparer.compare).not.toHaveBeenCalled();
    });

    it('should return Unauthorized (401) when password comparison fails', async () => {
      arrangeSuccessMocks();
      hashComparer.compare.mockResolvedValue(false);

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      expect((result.value as HttpException).getStatus()).toBe(401);
      expect(
        workspaceUserRepository.findDefaultWorkspaceByUserId,
      ).not.toHaveBeenCalled();
    });

    it('should return Unauthorized (401) when user has no default workspace', async () => {
      arrangeSuccessMocks();
      workspaceUserRepository.findDefaultWorkspaceByUserId.mockResolvedValue(
        null,
      );

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      expect((result.value as HttpException).getStatus()).toBe(401);
      expect(encrypter.encrypt).not.toHaveBeenCalled();
    });
  });
});
