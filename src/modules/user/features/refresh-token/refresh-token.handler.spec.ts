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
import { RefreshTokenService } from './refresh-token.service';

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;
  let userRepository: jest.Mocked<UserRepository>;
  let refreshTokensRepository: jest.Mocked<RefreshTokensRepository>;
  let workspaceUserRepository: jest.Mocked<WorkspaceUserRepository>;
  let decoder: jest.Mocked<Decoder>;
  let encrypter: jest.Mocked<Encrypter>;
  let dateAddition: jest.Mocked<DateAddition>;

  const mockUser = createMockUser();
  const mockWorkspaceResult = createMockDefaultWorkspaceResult();
  const mockRefreshToken = createMockRefreshToken({
    token: 'refresh_token_abc',
  });

  const validTokenInput = 'refresh_token_abc';
  const validPayload = {
    sub: mockUser.id,
    workspaceId: 'workspace-id-123',
    role: UserRole.OWNER,
  };

  const arrangeSuccessMocks = () => {
    decoder.decrypt.mockResolvedValue({ payload: validPayload, isValid: true });
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
    dateAddition.addDaysInCurrentDate.mockReturnValue(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );
    refreshTokensRepository.create.mockResolvedValue(undefined);
  };

  beforeEach(async () => {
    userRepository = createMockUserRepository();
    refreshTokensRepository = createMockRefreshTokensRepository();
    workspaceUserRepository = createMockWorkspaceUserRepository();
    decoder = createMockDecoder();
    encrypter = createMockEncrypter();
    dateAddition = createMockDateAddition();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        { provide: UserRepository, useValue: userRepository },
        { provide: RefreshTokensRepository, useValue: refreshTokensRepository },
        { provide: WorkspaceUserRepository, useValue: workspaceUserRepository },
        { provide: Decoder, useValue: decoder },
        { provide: Encrypter, useValue: encrypter },
        { provide: DateAddition, useValue: dateAddition },
      ],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute()', () => {
    it('should orchestrate refresh flow and return new tokens on success (Right)', async () => {
      arrangeSuccessMocks();

      const result = await service.execute(validTokenInput);

      expect(decoder.decrypt).toHaveBeenCalledWith(validTokenInput);
      expect(userRepository.findUniqueById).toHaveBeenCalledWith(
        validPayload.sub,
      );
      expect(
        refreshTokensRepository.findUniqueByUserIdAndToken,
      ).toHaveBeenCalledWith(mockUser.id, validTokenInput);
      expect(refreshTokensRepository.delete).toHaveBeenCalledWith(
        mockRefreshToken.id,
      );
      expect(
        workspaceUserRepository.findDefaultWorkspaceByUserId,
      ).toHaveBeenCalledWith(mockUser.id);
      expect(encrypter.encrypt).toHaveBeenCalledTimes(2); // Access & Refresh
      expect(refreshTokensRepository.create).toHaveBeenCalled();

      const deleteOrder =
        refreshTokensRepository.delete.mock.invocationCallOrder[0];
      const createOrder =
        refreshTokensRepository.create.mock.invocationCallOrder[0];
      expect(deleteOrder).toBeLessThan(createOrder);

      expect(result.isRight()).toBe(true);
      const tokens = result.value as {
        accessToken: string;
        refreshToken: string;
      };
      expect(tokens.accessToken).toBe('new_access_token');
      expect(tokens.refreshToken).toBe('new_refresh_token');
    });

    it('should return Unauthorized (401) when token decryption fails', async () => {
      arrangeSuccessMocks();
      decoder.decrypt.mockResolvedValue({ isValid: false, payload: undefined });

      const result = await service.execute(validTokenInput);

      expect(result.isLeft()).toBe(true);
      expect((result.value as HttpException).getStatus()).toBe(401);
      expect(userRepository.findUniqueById).not.toHaveBeenCalled();
    });

    it('should return Not Found (404) when user is not found', async () => {
      arrangeSuccessMocks();
      userRepository.findUniqueById.mockResolvedValue(null);

      const result = await service.execute(validTokenInput);

      expect(result.isLeft()).toBe(true);
      expect((result.value as HttpException).getStatus()).toBe(404);
      expect(
        refreshTokensRepository.findUniqueByUserIdAndToken,
      ).not.toHaveBeenCalled();
    });

    it('should return Unauthorized (401) when old token is not in DB', async () => {
      arrangeSuccessMocks();
      refreshTokensRepository.findUniqueByUserIdAndToken.mockResolvedValue(
        null,
      );

      const result = await service.execute(validTokenInput);

      expect(result.isLeft()).toBe(true);
      expect((result.value as HttpException).getStatus()).toBe(401);
      expect(refreshTokensRepository.delete).not.toHaveBeenCalled();
    });

    it('should return Unauthorized (401) when user has no default workspace', async () => {
      arrangeSuccessMocks();
      workspaceUserRepository.findDefaultWorkspaceByUserId.mockResolvedValue(
        null,
      );

      const result = await service.execute(validTokenInput);

      expect(result.isLeft()).toBe(true);
      expect((result.value as HttpException).getStatus()).toBe(401);
      expect(encrypter.encrypt).not.toHaveBeenCalled();
    });
  });
});
