import { User } from '@modules/user/entities/User';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import {
  createMockUser,
  createMockUserRepository,
} from '@modules/user/test-helpers/mock-factories';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { GetProfileHandler } from './get-profile.handler';

describe('GetProfileHandler', () => {
  let handler: GetProfileHandler;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    userRepository = createMockUserRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProfileHandler,
        {
          provide: UserRepository,
          useValue: userRepository,
        },
      ],
    }).compile();

    handler = module.get<GetProfileHandler>(GetProfileHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute - Success Cases', () => {
    it('should retrieve user profile successfully', async () => {
      const request: TokenPayloadBase = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-123',
      };

      const mockUser = createMockUser();
      userRepository.findUniqueById.mockResolvedValue(mockUser);

      const result = await handler.execute(request);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toBeInstanceOf(User);
        expect(result.value).toEqual(mockUser);
      }
    });

    it('should find user by ID from token payload', async () => {
      const request: TokenPayloadBase = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-123',
      };

      const mockUser = createMockUser();
      userRepository.findUniqueById.mockResolvedValue(mockUser);

      await handler.execute(request);

      expect(userRepository.findUniqueById).toHaveBeenCalledWith('user-id-123');
      expect(userRepository.findUniqueById).toHaveBeenCalledTimes(1);
    });

    it('should return user with all properties', async () => {
      const request: TokenPayloadBase = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-123',
      };

      const mockUser = createMockUser();
      userRepository.findUniqueById.mockResolvedValue(mockUser);

      const result = await handler.execute(request);

      if (result.isRight()) {
        expect(result.value.id).toBeDefined();
        expect(result.value.name).toBeDefined();
        expect(result.value.email).toBeDefined();
        expect(result.value.createdAt).toBeDefined();
      }
    });

    it('should return user with correct ID', async () => {
      const request: TokenPayloadBase = {
        sub: 'user-id-456',
        workspaceId: 'workspace-id-123',
      };

      const mockUser = createMockUser();
      userRepository.findUniqueById.mockResolvedValue(mockUser);

      await handler.execute(request);

      expect(userRepository.findUniqueById).toHaveBeenCalledWith('user-id-456');
    });
  });

  describe('execute - User Not Found Error', () => {
    it('should return not found error when user does not exist', async () => {
      const request: TokenPayloadBase = {
        sub: 'nonexistent-user-id',
        workspaceId: 'workspace-id-123',
      };

      userRepository.findUniqueById.mockResolvedValue(null);

      const result = await handler.execute(request);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(HttpException);
        expect(result.value.getStatus()).toBe(404);
        expect(result.value.message).toContain('User not found');
      }
    });

    it('should attempt to find user even if not found', async () => {
      const request: TokenPayloadBase = {
        sub: 'nonexistent-user-id',
        workspaceId: 'workspace-id-123',
      };

      userRepository.findUniqueById.mockResolvedValue(null);

      await handler.execute(request);

      expect(userRepository.findUniqueById).toHaveBeenCalledWith(
        'nonexistent-user-id',
      );
    });

    it('should return 404 status code', async () => {
      const request: TokenPayloadBase = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-123',
      };

      userRepository.findUniqueById.mockResolvedValue(null);

      const result = await handler.execute(request);

      if (result.isLeft()) {
        expect(result.value.getStatus()).toBe(404);
      }
    });
  });

  describe('execute - Return Type', () => {
    it('should return Either monad', async () => {
      const request: TokenPayloadBase = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-123',
      };

      const mockUser = createMockUser();
      userRepository.findUniqueById.mockResolvedValue(mockUser);

      const result = await handler.execute(request);

      expect(result).toHaveProperty('isLeft');
      expect(result).toHaveProperty('isRight');
      expect(typeof result.isLeft).toBe('function');
      expect(typeof result.isRight).toBe('function');
    });

    it('should have value property on Either result', async () => {
      const request: TokenPayloadBase = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-123',
      };

      const mockUser = createMockUser();
      userRepository.findUniqueById.mockResolvedValue(mockUser);

      const result = await handler.execute(request);

      expect(result).toHaveProperty('value');
    });
  });

  describe('execute - Request Handling', () => {
    it('should extract sub from token payload', async () => {
      const request: TokenPayloadBase = {
        sub: 'specific-user-id',
        workspaceId: 'workspace-id-123',
      };

      const mockUser = createMockUser();
      userRepository.findUniqueById.mockResolvedValue(mockUser);

      await handler.execute(request);

      expect(userRepository.findUniqueById).toHaveBeenCalledWith(
        'specific-user-id',
      );
    });

    it('should handle multiple different user IDs', async () => {
      const request1: TokenPayloadBase = {
        sub: 'user-id-1',
        workspaceId: 'workspace-id-123',
      };

      const request2: TokenPayloadBase = {
        sub: 'user-id-2',
        workspaceId: 'workspace-id-456',
      };

      const mockUser = createMockUser();
      userRepository.findUniqueById.mockResolvedValue(mockUser);

      await handler.execute(request1);
      await handler.execute(request2);

      expect(userRepository.findUniqueById).toHaveBeenNthCalledWith(
        1,
        'user-id-1',
      );
      expect(userRepository.findUniqueById).toHaveBeenNthCalledWith(
        2,
        'user-id-2',
      );
    });
  });

  describe('execute - Dependencies', () => {
    it('should use injected UserRepository', async () => {
      const request: TokenPayloadBase = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-123',
      };

      userRepository.findUniqueById.mockResolvedValue(null);

      await handler.execute(request);

      expect(userRepository.findUniqueById).toHaveBeenCalled();
    });
  });

  describe('execute - Edge Cases', () => {
    it('should handle user with all optional fields populated', async () => {
      const request: TokenPayloadBase = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-123',
      };

      const mockUser = createMockUser({
        phone: '+1234567890',
        avatarUrl: 'https://example.com/avatar.jpg',
      });
      userRepository.findUniqueById.mockResolvedValue(mockUser);

      const result = await handler.execute(request);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.phone).toBeDefined();
        expect(result.value.avatarUrl).toBeDefined();
      }
    });

    it('should handle user with optional fields as null', async () => {
      const request: TokenPayloadBase = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-123',
      };

      const mockUser = createMockUser();
      userRepository.findUniqueById.mockResolvedValue(mockUser);

      const result = await handler.execute(request);

      expect(result.isRight()).toBe(true);
    });
  });
});
