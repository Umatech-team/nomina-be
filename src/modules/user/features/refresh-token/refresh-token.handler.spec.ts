import { UserRole } from '@constants/enums';
import { RefreshTokensRepository } from '@modules/user/repositories/contracts/refresh-token.repository';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import {
  createMockDateAddition,
  createMockDecoder,
  createMockDefaultWorkspaceResult,
  createMockEncrypter,
  createMockRefreshToken,
  createMockRefreshTokensRepository,
  createMockUser,
  createMockUserRepository,
  createMockWorkspaceUserRepository,
} from '@modules/user/test-helpers/mock-factories';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Decoder } from '@providers/cryptography/contracts/Decoder';
import { Encrypter } from '@providers/cryptography/contracts/Encrypter';
import { DateAddition } from '@providers/date/contracts/DateAddition';
import { RefreshTokenHandler } from './refresh-token.handler';

describe('RefreshTokenHandler', () => {
  let handler: RefreshTokenHandler;
  let userRepository: jest.Mocked<UserRepository>;
  let refreshTokensRepository: jest.Mocked<RefreshTokensRepository>;
  let workspaceUserRepository: jest.Mocked<WorkspaceUserRepository>;
  let decoder: jest.Mocked<Decoder>;
  let encrypter: jest.Mocked<Encrypter>;
  let dateAddition: jest.Mocked<DateAddition>;

  beforeEach(async () => {
    userRepository = createMockUserRepository();
    refreshTokensRepository = createMockRefreshTokensRepository();
    workspaceUserRepository = createMockWorkspaceUserRepository();
    decoder = createMockDecoder();
    encrypter = createMockEncrypter();
    dateAddition = createMockDateAddition();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenHandler,
        {
          provide: UserRepository,
          useValue: userRepository,
        },
        {
          provide: RefreshTokensRepository,
          useValue: refreshTokensRepository,
        },
        {
          provide: WorkspaceUserRepository,
          useValue: workspaceUserRepository,
        },
        {
          provide: Decoder,
          useValue: decoder,
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

    handler = module.get<RefreshTokenHandler>(RefreshTokenHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute - Success Cases', () => {
    it('should refresh tokens successfully with valid refresh token', async () => {
      const refreshTokenInput = 'refresh_token_abc';

      const mockUser = createMockUser();
      const mockWorkspaceResult = createMockDefaultWorkspaceResult();
      const mockRefreshToken = createMockRefreshToken({
        token: refreshTokenInput,
      });

      decoder.decrypt.mockResolvedValue({
        payload: {
          sub: 'user-id-123',
          workspaceId: 'workspace-id-123',
          role: UserRole.OWNER,
        },
        isValid: true,
      });
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      refreshTokensRepository.findUniqueByUserIdAndToken.mockResolvedValue(
        mockRefreshToken,
      );
      refreshTokensRepository.delete.mockResolvedValue(undefined);
      workspaceUserRepository.findDefaultWorkspaceByUserId.mockResolvedValue(
        mockWorkspaceResult,
      );
      encrypter.encrypt
        .mockResolvedValueOnce('new_access_token')
        .mockResolvedValueOnce('new_refresh_token');
      dateAddition.addDaysInCurrentDate.mockReturnValue(new Date());
      refreshTokensRepository.create.mockResolvedValue(undefined);

      const result = await handler.execute(refreshTokenInput);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toHaveProperty('accessToken');
        expect(result.value).toHaveProperty('refreshToken');
      }
    });

    it('should decode and validate refresh token', async () => {
      const refreshTokenInput = 'refresh_token_abc';

      const mockUser = createMockUser();
      const mockWorkspaceResult = createMockDefaultWorkspaceResult();
      const mockRefreshToken = createMockRefreshToken();

      decoder.decrypt.mockResolvedValue({
        payload: {
          sub: 'user-id-123',
          workspaceId: 'workspace-id-123',
          role: UserRole.OWNER,
        },
        isValid: true,
      });
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      refreshTokensRepository.findUniqueByUserIdAndToken.mockResolvedValue(
        mockRefreshToken,
      );
      refreshTokensRepository.delete.mockResolvedValue(undefined);
      workspaceUserRepository.findDefaultWorkspaceByUserId.mockResolvedValue(
        mockWorkspaceResult,
      );
      encrypter.encrypt
        .mockResolvedValueOnce('new_access_token')
        .mockResolvedValueOnce('new_refresh_token');
      dateAddition.addDaysInCurrentDate.mockReturnValue(new Date());
      refreshTokensRepository.create.mockResolvedValue(undefined);

      await handler.execute(refreshTokenInput);

      expect(decoder.decrypt).toHaveBeenCalledWith(refreshTokenInput);
    });

    it('should delete old refresh token before creating new one', async () => {
      const refreshTokenInput = 'refresh_token_abc';

      const mockUser = createMockUser();
      const mockWorkspaceResult = createMockDefaultWorkspaceResult();
      const mockRefreshToken = createMockRefreshToken();

      decoder.decrypt.mockResolvedValue({
        payload: {
          sub: 'user-id-123',

          workspaceId: 'workspace-id-123',

          role: UserRole.OWNER,
        },
        isValid: true,
      });
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      refreshTokensRepository.findUniqueByUserIdAndToken.mockResolvedValue(
        mockRefreshToken,
      );
      refreshTokensRepository.delete.mockResolvedValue(undefined);
      workspaceUserRepository.findDefaultWorkspaceByUserId.mockResolvedValue(
        mockWorkspaceResult,
      );
      encrypter.encrypt
        .mockResolvedValueOnce('new_access_token')
        .mockResolvedValueOnce('new_refresh_token');
      dateAddition.addDaysInCurrentDate.mockReturnValue(new Date());
      refreshTokensRepository.create.mockResolvedValue(undefined);

      await handler.execute(refreshTokenInput);

      // Verify delete was called before create by checking call order
      const deleteCall =
        refreshTokensRepository.delete.mock.invocationCallOrder[0];
      const createCall =
        refreshTokensRepository.create.mock.invocationCallOrder[0];
      expect(deleteCall).toBeLessThan(createCall);
    });

    it('should return new access and refresh tokens', async () => {
      const refreshTokenInput = 'refresh_token_abc';

      const mockUser = createMockUser();
      const mockWorkspaceResult = createMockDefaultWorkspaceResult();
      const mockRefreshToken = createMockRefreshToken();

      decoder.decrypt.mockResolvedValue({
        payload: {
          sub: 'user-id-123',

          workspaceId: 'workspace-id-123',

          role: UserRole.OWNER,
        },
        isValid: true,
      });
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      refreshTokensRepository.findUniqueByUserIdAndToken.mockResolvedValue(
        mockRefreshToken,
      );
      refreshTokensRepository.delete.mockResolvedValue(undefined);
      workspaceUserRepository.findDefaultWorkspaceByUserId.mockResolvedValue(
        mockWorkspaceResult,
      );
      encrypter.encrypt
        .mockResolvedValueOnce('new_access_token')
        .mockResolvedValueOnce('new_refresh_token');
      dateAddition.addDaysInCurrentDate.mockReturnValue(new Date());
      refreshTokensRepository.create.mockResolvedValue(undefined);

      const result = await handler.execute(refreshTokenInput);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.accessToken).toBe('new_access_token');
      }
    });

    it('should generate access token with correct JWT payload', async () => {
      const refreshTokenInput = 'refresh_token_abc';

      const mockUser = createMockUser();
      const mockWorkspaceResult = createMockDefaultWorkspaceResult();
      const mockRefreshToken = createMockRefreshToken();

      decoder.decrypt.mockResolvedValue({
        payload: {
          sub: 'user-id-123',

          workspaceId: 'workspace-id-123',

          role: UserRole.OWNER,
        },
        isValid: true,
      });
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      refreshTokensRepository.findUniqueByUserIdAndToken.mockResolvedValue(
        mockRefreshToken,
      );
      refreshTokensRepository.delete.mockResolvedValue(undefined);
      workspaceUserRepository.findDefaultWorkspaceByUserId.mockResolvedValue(
        mockWorkspaceResult,
      );
      encrypter.encrypt
        .mockResolvedValueOnce('new_access_token')
        .mockResolvedValueOnce('new_refresh_token');
      dateAddition.addDaysInCurrentDate.mockReturnValue(new Date());
      refreshTokensRepository.create.mockResolvedValue(undefined);

      await handler.execute(refreshTokenInput);

      const firstEncrypterCall = encrypter.encrypt.mock.calls[0];
      const accessTokenPayload = firstEncrypterCall[0];

      expect(accessTokenPayload).toHaveProperty('sub', mockUser.id);
      expect(accessTokenPayload).toHaveProperty('name', mockUser.name);
      expect(accessTokenPayload).toHaveProperty(
        'workspaceId',
        mockWorkspaceResult.user.workspaceId,
      );
    });
  });

  describe('execute - Token Decode Errors', () => {
    it('should return session expired when token decode fails', async () => {
      const refreshTokenInput = 'invalid_token';

      decoder.decrypt.mockResolvedValue({
        isValid: false,
        payload: undefined,
      });

      const result = await handler.execute(refreshTokenInput);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(HttpException);
        expect(result.value.getStatus()).toBe(401);
        expect(result.value.message).toContain('Session expired');
      }
    });

    it('should return session expired when token has no payload', async () => {
      const refreshTokenInput = 'token_without_payload';

      decoder.decrypt.mockResolvedValue({
        isValid: true,
        payload: undefined,
      });

      const result = await handler.execute(refreshTokenInput);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.getStatus()).toBe(401);
      }
    });

    it('should not proceed when token is invalid', async () => {
      const refreshTokenInput = 'invalid_token';

      decoder.decrypt.mockResolvedValue({
        isValid: false,
        payload: undefined,
      });

      await handler.execute(refreshTokenInput);

      expect(userRepository.findUniqueById).not.toHaveBeenCalled();
    });
  });

  describe('execute - User Not Found Error', () => {
    it('should return user not found when user does not exist', async () => {
      const refreshTokenInput = 'refresh_token_abc';

      decoder.decrypt.mockResolvedValue({
        payload: {
          sub: 'nonexistent-user',

          workspaceId: 'workspace-id-123',

          role: UserRole.OWNER,
        },
        isValid: true,
      });
      userRepository.findUniqueById.mockResolvedValue(null);

      const result = await handler.execute(refreshTokenInput);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(HttpException);
        expect(result.value.getStatus()).toBe(404);
        expect(result.value.message).toContain('User not found');
      }
    });

    it('should not check refresh tokens when user not found', async () => {
      const refreshTokenInput = 'refresh_token_abc';

      decoder.decrypt.mockResolvedValue({
        payload: {
          sub: 'nonexistent-user',

          workspaceId: 'workspace-id-123',

          role: UserRole.OWNER,
        },
        isValid: true,
      });
      userRepository.findUniqueById.mockResolvedValue(null);

      await handler.execute(refreshTokenInput);

      expect(
        refreshTokensRepository.findUniqueByUserIdAndToken,
      ).not.toHaveBeenCalled();
    });
  });

  describe('execute - Refresh Token Not In DB Error', () => {
    it('should return session expired when refresh token not in DB', async () => {
      const refreshTokenInput = 'refresh_token_abc';

      const mockUser = createMockUser();

      decoder.decrypt.mockResolvedValue({
        payload: {
          sub: 'user-id-123',

          workspaceId: 'workspace-id-123',

          role: UserRole.OWNER,
        },
        isValid: true,
      });
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      refreshTokensRepository.findUniqueByUserIdAndToken.mockResolvedValue(
        null,
      );

      const result = await handler.execute(refreshTokenInput);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(HttpException);
        expect(result.value.getStatus()).toBe(401);
      }
    });

    it('should not generate tokens when refresh token not in DB', async () => {
      const refreshTokenInput = 'refresh_token_abc';

      const mockUser = createMockUser();

      decoder.decrypt.mockResolvedValue({
        payload: {
          sub: 'user-id-123',

          workspaceId: 'workspace-id-123',

          role: UserRole.OWNER,
        },
        isValid: true,
      });
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      refreshTokensRepository.findUniqueByUserIdAndToken.mockResolvedValue(
        null,
      );

      await handler.execute(refreshTokenInput);

      expect(encrypter.encrypt).not.toHaveBeenCalled();
    });
  });

  describe('execute - No Default Workspace Error', () => {
    it('should return session expired when workspace not found', async () => {
      const refreshTokenInput = 'refresh_token_abc';

      const mockUser = createMockUser();
      const mockRefreshToken = createMockRefreshToken();

      decoder.decrypt.mockResolvedValue({
        payload: {
          sub: 'user-id-123',

          workspaceId: 'workspace-id-123',

          role: UserRole.OWNER,
        },
        isValid: true,
      });
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      refreshTokensRepository.findUniqueByUserIdAndToken.mockResolvedValue(
        mockRefreshToken,
      );
      refreshTokensRepository.delete.mockResolvedValue(undefined);
      workspaceUserRepository.findDefaultWorkspaceByUserId.mockResolvedValue(
        null,
      );

      const result = await handler.execute(refreshTokenInput);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.getStatus()).toBe(401);
      }
    });

    it('should not create new tokens when workspace not found', async () => {
      const refreshTokenInput = 'refresh_token_abc';

      const mockUser = createMockUser();
      const mockRefreshToken = createMockRefreshToken();

      decoder.decrypt.mockResolvedValue({
        payload: {
          sub: 'user-id-123',

          workspaceId: 'workspace-id-123',

          role: UserRole.OWNER,
        },
        isValid: true,
      });
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      refreshTokensRepository.findUniqueByUserIdAndToken.mockResolvedValue(
        mockRefreshToken,
      );
      refreshTokensRepository.delete.mockResolvedValue(undefined);
      workspaceUserRepository.findDefaultWorkspaceByUserId.mockResolvedValue(
        null,
      );

      await handler.execute(refreshTokenInput);

      expect(refreshTokensRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('execute - Return Type', () => {
    it('should return Either monad', async () => {
      const refreshTokenInput = 'refresh_token_abc';

      const mockUser = createMockUser();
      const mockWorkspaceResult = createMockDefaultWorkspaceResult();
      const mockRefreshToken = createMockRefreshToken();

      decoder.decrypt.mockResolvedValue({
        payload: {
          sub: 'user-id-123',

          workspaceId: 'workspace-id-123',

          role: UserRole.OWNER,
        },
        isValid: true,
      });
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      refreshTokensRepository.findUniqueByUserIdAndToken.mockResolvedValue(
        mockRefreshToken,
      );
      refreshTokensRepository.delete.mockResolvedValue(undefined);
      workspaceUserRepository.findDefaultWorkspaceByUserId.mockResolvedValue(
        mockWorkspaceResult,
      );
      encrypter.encrypt
        .mockResolvedValueOnce('new_access_token')
        .mockResolvedValueOnce('new_refresh_token');
      dateAddition.addDaysInCurrentDate.mockReturnValue(new Date());
      refreshTokensRepository.create.mockResolvedValue(undefined);

      const result = await handler.execute(refreshTokenInput);

      expect(result).toHaveProperty('isLeft');
      expect(result).toHaveProperty('isRight');
      expect(typeof result.isLeft).toBe('function');
      expect(typeof result.isRight).toBe('function');
    });
  });

  describe('execute - Dependencies', () => {
    it('should use injected Decoder', async () => {
      const refreshTokenInput = 'refresh_token_abc';

      decoder.decrypt.mockResolvedValue({
        isValid: false,
        payload: undefined,
      });

      await handler.execute(refreshTokenInput);

      expect(decoder.decrypt).toHaveBeenCalled();
    });

    it('should use injected UserRepository', async () => {
      const refreshTokenInput = 'refresh_token_abc';

      const mockUser = createMockUser();

      decoder.decrypt.mockResolvedValue({
        payload: {
          sub: 'user-id-123',

          workspaceId: 'workspace-id-123',

          role: UserRole.OWNER,
        },
        isValid: true,
      });
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      refreshTokensRepository.findUniqueByUserIdAndToken.mockResolvedValue(
        null,
      );

      await handler.execute(refreshTokenInput);

      expect(userRepository.findUniqueById).toHaveBeenCalled();
    });

    it('should use injected RefreshTokensRepository', async () => {
      const refreshTokenInput = 'refresh_token_abc';

      const mockUser = createMockUser();

      decoder.decrypt.mockResolvedValue({
        payload: {
          sub: 'user-id-123',

          workspaceId: 'workspace-id-123',

          role: UserRole.OWNER,
        },
        isValid: true,
      });
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      refreshTokensRepository.findUniqueByUserIdAndToken.mockResolvedValue(
        null,
      );

      await handler.execute(refreshTokenInput);

      expect(
        refreshTokensRepository.findUniqueByUserIdAndToken,
      ).toHaveBeenCalled();
    });

    it('should use injected Encrypter', async () => {
      const refreshTokenInput = 'refresh_token_abc';

      const mockUser = createMockUser();
      const mockWorkspaceResult = createMockDefaultWorkspaceResult();
      const mockRefreshToken = createMockRefreshToken();

      decoder.decrypt.mockResolvedValue({
        payload: {
          sub: 'user-id-123',

          workspaceId: 'workspace-id-123',

          role: UserRole.OWNER,
        },
        isValid: true,
      });
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      refreshTokensRepository.findUniqueByUserIdAndToken.mockResolvedValue(
        mockRefreshToken,
      );
      refreshTokensRepository.delete.mockResolvedValue(undefined);
      workspaceUserRepository.findDefaultWorkspaceByUserId.mockResolvedValue(
        mockWorkspaceResult,
      );
      encrypter.encrypt
        .mockResolvedValueOnce('new_access_token')
        .mockResolvedValueOnce('new_refresh_token');
      dateAddition.addDaysInCurrentDate.mockReturnValue(new Date());
      refreshTokensRepository.create.mockResolvedValue(undefined);

      await handler.execute(refreshTokenInput);

      expect(encrypter.encrypt).toHaveBeenCalled();
    });
  });
});
