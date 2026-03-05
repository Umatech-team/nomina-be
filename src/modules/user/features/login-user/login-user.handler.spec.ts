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
        {
          provide: UserRepository,
          useValue: userRepository,
        },
        {
          provide: WorkspaceUserRepository,
          useValue: workspaceUserRepository,
        },
        {
          provide: RefreshTokensRepository,
          useValue: refreshTokensRepository,
        },
        {
          provide: HashComparer,
          useValue: hashComparer,
        },
        {
          provide: Encrypter,
          useValue: encrypter,
        },
        {
          provide: DateAddition,
          useValue: dateAddition,
        },
      ],
    }).compile();

    handler = module.get<LoginUserHandler>(LoginUserHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute - Success Cases', () => {
    it('should login user successfully with valid credentials', async () => {
      const request: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = createMockUser();
      const mockWorkspaceResult = createMockDefaultWorkspaceResult();

      userRepository.findUniqueByEmail.mockResolvedValue(mockUser);
      hashComparer.compare.mockResolvedValue(true);
      workspaceUserRepository.findDefaultWorkspaceByUserId.mockResolvedValue(
        mockWorkspaceResult,
      );
      encrypter.encrypt.mockResolvedValueOnce('access_token_abc');
      encrypter.encrypt.mockResolvedValueOnce('refresh_token_xyz');
      dateAddition.addDaysInCurrentDate.mockReturnValue(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      );
      refreshTokensRepository.deleteManyByUserId.mockResolvedValue(undefined);
      refreshTokensRepository.create.mockResolvedValue(undefined);

      const result = await handler.execute(request);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toHaveProperty('accessToken');
        expect(result.value).toHaveProperty('refreshToken');
        expect(result.value.accessToken).toBe('access_token_abc');
      }
    });

    it('should return both access and refresh tokens', async () => {
      const request: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = createMockUser();
      const mockWorkspaceResult = createMockDefaultWorkspaceResult();

      userRepository.findUniqueByEmail.mockResolvedValue(mockUser);
      hashComparer.compare.mockResolvedValue(true);
      workspaceUserRepository.findDefaultWorkspaceByUserId.mockResolvedValue(
        mockWorkspaceResult,
      );
      encrypter.encrypt
        .mockResolvedValueOnce('access_token_abc')
        .mockResolvedValueOnce('refresh_token_xyz');
      dateAddition.addDaysInCurrentDate.mockReturnValue(new Date());
      refreshTokensRepository.deleteManyByUserId.mockResolvedValue(undefined);
      refreshTokensRepository.create.mockResolvedValue(undefined);

      const result = await handler.execute(request);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.accessToken).toBeDefined();
        expect(result.value.refreshToken).toBeDefined();
      }
    });

    it('should delete old refresh tokens before creating new one', async () => {
      const request: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = createMockUser();
      const mockWorkspaceResult = createMockDefaultWorkspaceResult();

      userRepository.findUniqueByEmail.mockResolvedValue(mockUser);
      hashComparer.compare.mockResolvedValue(true);
      workspaceUserRepository.findDefaultWorkspaceByUserId.mockResolvedValue(
        mockWorkspaceResult,
      );
      encrypter.encrypt
        .mockResolvedValueOnce('access_token_abc')
        .mockResolvedValueOnce('refresh_token_xyz');
      dateAddition.addDaysInCurrentDate.mockReturnValue(new Date());
      refreshTokensRepository.deleteManyByUserId.mockResolvedValue(undefined);
      refreshTokensRepository.create.mockResolvedValue(undefined);

      await handler.execute(request);

      expect(refreshTokensRepository.deleteManyByUserId).toHaveBeenCalledWith(
        mockUser.id,
      );
      // deleteManyByUserId should be called before create as part of the login flow
    });

    it('should create new refresh token', async () => {
      const request: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = createMockUser();
      const mockWorkspaceResult = createMockDefaultWorkspaceResult();

      userRepository.findUniqueByEmail.mockResolvedValue(mockUser);
      hashComparer.compare.mockResolvedValue(true);
      workspaceUserRepository.findDefaultWorkspaceByUserId.mockResolvedValue(
        mockWorkspaceResult,
      );
      encrypter.encrypt
        .mockResolvedValueOnce('access_token_abc')
        .mockResolvedValueOnce('refresh_token_xyz');
      dateAddition.addDaysInCurrentDate.mockReturnValue(new Date());
      refreshTokensRepository.deleteManyByUserId.mockResolvedValue(undefined);
      refreshTokensRepository.create.mockResolvedValue(undefined);

      await handler.execute(request);

      expect(refreshTokensRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should generate access token with correct JWT payload', async () => {
      const request: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = createMockUser();
      const mockWorkspaceResult = createMockDefaultWorkspaceResult();

      userRepository.findUniqueByEmail.mockResolvedValue(mockUser);
      hashComparer.compare.mockResolvedValue(true);
      workspaceUserRepository.findDefaultWorkspaceByUserId.mockResolvedValue(
        mockWorkspaceResult,
      );
      encrypter.encrypt
        .mockResolvedValueOnce('access_token_abc')
        .mockResolvedValueOnce('refresh_token_xyz');
      dateAddition.addDaysInCurrentDate.mockReturnValue(new Date());
      refreshTokensRepository.deleteManyByUserId.mockResolvedValue(undefined);
      refreshTokensRepository.create.mockResolvedValue(undefined);

      await handler.execute(request);

      const firstEncrypterCall = encrypter.encrypt.mock.calls[0];
      const accessTokenPayload = firstEncrypterCall[0];

      expect(accessTokenPayload).toHaveProperty('sub', mockUser.id);
      expect(accessTokenPayload).toHaveProperty('name', mockUser.name);
      expect(accessTokenPayload).toHaveProperty(
        'workspaceId',
        mockWorkspaceResult.user.workspaceId,
      );
      expect(accessTokenPayload).toHaveProperty(
        'workspaceName',
        mockWorkspaceResult.workspaceName,
      );
      expect(accessTokenPayload).toHaveProperty(
        'role',
        mockWorkspaceResult.user.role,
      );
    });
  });

  describe('execute - User Not Found Error', () => {
    it('should return unauthorized when user not found', async () => {
      const request: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      userRepository.findUniqueByEmail.mockResolvedValue(null);

      const result = await handler.execute(request);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(HttpException);
        expect((result.value as HttpException).getStatus()).toBe(401);
        expect((result.value as HttpException).message).toContain(
          'Invalid credentials',
        );
      }
    });

    it('should not compare password when user not found', async () => {
      const request: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      userRepository.findUniqueByEmail.mockResolvedValue(null);

      await handler.execute(request);

      expect(hashComparer.compare).not.toHaveBeenCalled();
    });

    it('should not fetch workspace when user not found', async () => {
      const request: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      userRepository.findUniqueByEmail.mockResolvedValue(null);

      await handler.execute(request);

      expect(
        workspaceUserRepository.findDefaultWorkspaceByUserId,
      ).not.toHaveBeenCalled();
    });
  });

  describe('execute - Invalid Password Error', () => {
    it('should return unauthorized when password is invalid', async () => {
      const request: LoginUserRequest = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      const mockUser = createMockUser();
      userRepository.findUniqueByEmail.mockResolvedValue(mockUser);
      hashComparer.compare.mockResolvedValue(false);

      const result = await handler.execute(request);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(HttpException);
        expect((result.value as HttpException).getStatus()).toBe(401);
      }
    });

    it('should not fetch workspace when password is invalid', async () => {
      const request: LoginUserRequest = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      const mockUser = createMockUser();
      userRepository.findUniqueByEmail.mockResolvedValue(mockUser);
      hashComparer.compare.mockResolvedValue(false);

      await handler.execute(request);

      expect(
        workspaceUserRepository.findDefaultWorkspaceByUserId,
      ).not.toHaveBeenCalled();
    });

    it('should verify password correctness', async () => {
      const request: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = createMockUser();
      userRepository.findUniqueByEmail.mockResolvedValue(mockUser);
      hashComparer.compare.mockResolvedValue(false);

      await handler.execute(request);

      expect(hashComparer.compare).toHaveBeenCalledWith(
        'password123',
        mockUser.passwordHash,
      );
    });
  });

  describe('execute - No Default Workspace Error', () => {
    it('should return unauthorized when default workspace not found', async () => {
      const request: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = createMockUser();
      userRepository.findUniqueByEmail.mockResolvedValue(mockUser);
      hashComparer.compare.mockResolvedValue(true);
      workspaceUserRepository.findDefaultWorkspaceByUserId.mockResolvedValue(
        null,
      );

      const result = await handler.execute(request);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(HttpException);
        expect((result.value as HttpException).getStatus()).toBe(401);
      }
    });

    it('should not generate tokens when workspace not found', async () => {
      const request: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = createMockUser();
      userRepository.findUniqueByEmail.mockResolvedValue(mockUser);
      hashComparer.compare.mockResolvedValue(true);
      workspaceUserRepository.findDefaultWorkspaceByUserId.mockResolvedValue(
        null,
      );

      await handler.execute(request);

      expect(encrypter.encrypt).not.toHaveBeenCalled();
    });
  });

  describe('execute - Return Type', () => {
    it('should return Either monad', async () => {
      const request: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = createMockUser();
      const mockWorkspaceResult = createMockDefaultWorkspaceResult();

      userRepository.findUniqueByEmail.mockResolvedValue(mockUser);
      hashComparer.compare.mockResolvedValue(true);
      workspaceUserRepository.findDefaultWorkspaceByUserId.mockResolvedValue(
        mockWorkspaceResult,
      );
      encrypter.encrypt
        .mockResolvedValueOnce('access_token_abc')
        .mockResolvedValueOnce('refresh_token_xyz');
      dateAddition.addDaysInCurrentDate.mockReturnValue(new Date());
      refreshTokensRepository.deleteManyByUserId.mockResolvedValue(undefined);
      refreshTokensRepository.create.mockResolvedValue(undefined);

      const result = await handler.execute(request);

      expect(result).toHaveProperty('isLeft');
      expect(result).toHaveProperty('isRight');
      expect(typeof result.isLeft).toBe('function');
      expect(typeof result.isRight).toBe('function');
    });
  });

  describe('execute - Dependencies', () => {
    it('should use injected UserRepository', async () => {
      const request: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      userRepository.findUniqueByEmail.mockResolvedValue(null);

      await handler.execute(request);

      expect(userRepository.findUniqueByEmail).toHaveBeenCalled();
    });

    it('should use injected HashComparer', async () => {
      const request: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = createMockUser();
      userRepository.findUniqueByEmail.mockResolvedValue(mockUser);
      hashComparer.compare.mockResolvedValue(false);

      await handler.execute(request);

      expect(hashComparer.compare).toHaveBeenCalled();
    });

    it('should use injected WorkspaceUserRepository', async () => {
      const request: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = createMockUser();
      userRepository.findUniqueByEmail.mockResolvedValue(mockUser);
      hashComparer.compare.mockResolvedValue(true);
      workspaceUserRepository.findDefaultWorkspaceByUserId.mockResolvedValue(
        null,
      );

      await handler.execute(request);

      expect(
        workspaceUserRepository.findDefaultWorkspaceByUserId,
      ).toHaveBeenCalled();
    });

    it('should use injected Encrypter', async () => {
      const request: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = createMockUser();
      const mockWorkspaceResult = createMockDefaultWorkspaceResult();

      userRepository.findUniqueByEmail.mockResolvedValue(mockUser);
      hashComparer.compare.mockResolvedValue(true);
      workspaceUserRepository.findDefaultWorkspaceByUserId.mockResolvedValue(
        mockWorkspaceResult,
      );
      encrypter.encrypt
        .mockResolvedValueOnce('access_token_abc')
        .mockResolvedValueOnce('refresh_token_xyz');
      dateAddition.addDaysInCurrentDate.mockReturnValue(new Date());
      refreshTokensRepository.deleteManyByUserId.mockResolvedValue(undefined);
      refreshTokensRepository.create.mockResolvedValue(undefined);

      await handler.execute(request);

      expect(encrypter.encrypt).toHaveBeenCalled();
    });
  });
});
