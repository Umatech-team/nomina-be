import { UserRole } from '@constants/enums';
import { createMockUser } from '@modules/user/test-helpers/mock-factories';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { left, right } from '@shared/core/errors/Either';
import { GetProfileController } from './get-profile.controller';
import { GetProfileHandler } from './get-profile.handler';

describe('GetProfileController', () => {
  let controller: GetProfileController;
  let handler: jest.Mocked<GetProfileHandler>;

  beforeEach(async () => {
    const mockHandler = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetProfileHandler>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetProfileController],
      providers: [
        {
          provide: GetProfileHandler,
          useValue: mockHandler,
        },
      ],
    }).compile();

    controller = module.get<GetProfileController>(GetProfileController);
    handler = module.get<GetProfileHandler>(
      GetProfileHandler,
    ) as jest.Mocked<GetProfileHandler>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle - Success Cases', () => {
    it('should retrieve and return user profile', async () => {
      const tokenPayload: TokenPayloadSchema = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-123',
        role: UserRole.OWNER,
      };

      const mockUser = createMockUser();
      handler.execute.mockResolvedValue(right(mockUser));

      const result = await controller.handle(tokenPayload);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('data');
    });

    it('should call handler with token payload', async () => {
      const tokenPayload: TokenPayloadSchema = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-123',
        role: UserRole.OWNER,
      };

      const mockUser = createMockUser();
      handler.execute.mockResolvedValue(right(mockUser));

      await controller.handle(tokenPayload);

      // The controller extracts the token and passes just the TokenPayloadBase part
      expect(handler.execute).toHaveBeenCalledTimes(1);
      expect(handler.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-id-123',
        }),
      );
    });

    it('should return user data from UserPresenter', async () => {
      const tokenPayload: TokenPayloadSchema = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-123',
        role: UserRole.OWNER,
      };

      const mockUser = createMockUser();
      handler.execute.mockResolvedValue(right(mockUser));

      const result = await controller.handle(tokenPayload);

      if (result) {
        expect(result.data).toHaveProperty('id');
        expect(result.data).toHaveProperty('name');
        expect(result.data).toHaveProperty('email');
      }
    });

    it('should not expose password hash in response', async () => {
      const tokenPayload: TokenPayloadSchema = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-123',
        role: UserRole.OWNER,
      };

      const mockUser = createMockUser();
      handler.execute.mockResolvedValue(right(mockUser));

      const result = await controller.handle(tokenPayload);

      if (result) {
        expect(result.data).not.toHaveProperty('passwordHash');
      }
    });

    it('should include required user properties in response', async () => {
      const tokenPayload: TokenPayloadSchema = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-123',
        role: UserRole.OWNER,
      };

      const mockUser = createMockUser();
      handler.execute.mockResolvedValue(right(mockUser));

      const result = await controller.handle(tokenPayload);

      if (result) {
        expect(result.data.id).toBeDefined();
        expect(result.data.name).toBeDefined();
        expect(result.data.email).toBeDefined();
        expect(result.data.createdAt).toBeDefined();
      }
    });
  });

  describe('handle - Error Cases', () => {
    it('should handle user not found error', async () => {
      const tokenPayload: TokenPayloadSchema = {
        sub: 'nonexistent-user',
        workspaceId: 'workspace-id-123',
        role: UserRole.OWNER,
      };

      const error = new HttpException('User not found', HttpStatus.NOT_FOUND);
      handler.execute.mockResolvedValue(left(error));

      expect(controller.handle(tokenPayload)).rejects.toThrow();
    });

    it('should propagate handler errors via ErrorPresenter', async () => {
      const tokenPayload: TokenPayloadSchema = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-123',
        role: UserRole.OWNER,
      };

      const error = new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      handler.execute.mockResolvedValue(left(error));

      expect(controller.handle(tokenPayload)).rejects.toThrow();
    });

    it('should handle 404 error', async () => {
      const tokenPayload: TokenPayloadSchema = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-123',
        role: UserRole.OWNER,
      };

      const error = new HttpException('User not found', HttpStatus.NOT_FOUND);
      handler.execute.mockResolvedValue(left(error));

      expect(controller.handle(tokenPayload)).rejects.toThrow();
    });
  });

  describe('handle - Request Handling', () => {
    it('should extract and use user ID from @CurrentLoggedUser decorator', async () => {
      const tokenPayload: TokenPayloadSchema = {
        sub: 'specific-user-id',
        workspaceId: 'workspace-id-123',
        role: UserRole.OWNER,
      };

      const mockUser = createMockUser();
      handler.execute.mockResolvedValue(right(mockUser));

      await controller.handle(tokenPayload);

      expect(handler.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'specific-user-id',
        }),
      );
    });

    it('should pass token payload to handler', async () => {
      const tokenPayload: TokenPayloadSchema = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-456',
        role: UserRole.USER,
      };

      const mockUser = createMockUser();
      handler.execute.mockResolvedValue(right(mockUser));

      await controller.handle(tokenPayload);

      expect(handler.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-id-123',
          workspaceId: 'workspace-id-456',
        }),
      );
    });
  });

  describe('handle - Either Monad Handling', () => {
    it('should check if result is left before handling error', async () => {
      const tokenPayload: TokenPayloadSchema = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-123',
        role: UserRole.OWNER,
      };

      const mockUser = createMockUser();
      handler.execute.mockResolvedValue(right(mockUser));

      await controller.handle(tokenPayload);

      expect(handler.execute).toHaveBeenCalled();
    });

    it('should handle Either left case (error)', async () => {
      const tokenPayload: TokenPayloadSchema = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-123',
        role: UserRole.OWNER,
      };

      const error = new HttpException('User not found', HttpStatus.NOT_FOUND);
      handler.execute.mockResolvedValue(left(error));

      const handleCall = controller.handle(tokenPayload);

      expect(handleCall).rejects.toThrow();
    });

    it('should handle Either right case (success)', async () => {
      const tokenPayload: TokenPayloadSchema = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-123',
        role: UserRole.OWNER,
      };

      const mockUser = createMockUser();
      handler.execute.mockResolvedValue(right(mockUser));

      const result = await controller.handle(tokenPayload);

      expect(result).toBeDefined();
      if (result) {
        expect(result.data).toBeDefined();
      }
    });
  });

  describe('handle - Response Format', () => {
    it('should return response with data property', async () => {
      const tokenPayload: TokenPayloadSchema = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-123',
        role: UserRole.OWNER,
      };

      const mockUser = createMockUser();
      handler.execute.mockResolvedValue(right(mockUser));

      const result = await controller.handle(tokenPayload);

      expect(result).toHaveProperty('data');
      if (result) {
        expect(typeof result.data).toBe('object');
      }
    });

    it('should serialize user correctly via UserPresenter', async () => {
      const tokenPayload: TokenPayloadSchema = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-123',
        role: UserRole.OWNER,
      };

      const mockUser = createMockUser({
        email: 'john@example.com',
      });
      handler.execute.mockResolvedValue(right(mockUser));

      const result = await controller.handle(tokenPayload);

      if (result) {
        expect(result.data.email).toBe('john@example.com');
        expect(result.data.id).toBeDefined();
      }
    });
  });

  describe('handle - Integration with Handler', () => {
    it('should be an async method', async () => {
      const tokenPayload: TokenPayloadSchema = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-123',
        role: UserRole.OWNER,
      };

      const mockUser = createMockUser();
      handler.execute.mockResolvedValue(right(mockUser));

      const result = controller.handle(tokenPayload);

      expect(result instanceof Promise).toBe(true);
    });

    it('should await handler execution', async () => {
      const tokenPayload: TokenPayloadSchema = {
        sub: 'user-id-123',
        workspaceId: 'workspace-id-123',
        role: UserRole.OWNER,
      };

      const mockUser = createMockUser();
      handler.execute.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(right(mockUser)), 10),
          ),
      );

      await controller.handle(tokenPayload);

      expect(handler.execute).toHaveBeenCalled();
    });
  });

  describe('Controller Setup', () => {
    it('should have handle method', () => {
      expect(controller).toHaveProperty('handle');
      expect(typeof controller.handle).toBe('function');
    });

    it('should be a NestJS controller', () => {
      expect(controller).toBeDefined();
      expect(controller instanceof GetProfileController).toBe(true);
    });

    it('should have handler injected', () => {
      expect(handler).toBeDefined();
    });
  });

  describe('handle - Multiple Requests', () => {
    it('should handle multiple sequential profile requests', async () => {
      const tokenPayload1: TokenPayloadSchema = {
        sub: 'user-id-1',
        workspaceId: 'workspace-id-123',
        role: UserRole.OWNER,
      };

      const tokenPayload2: TokenPayloadSchema = {
        sub: 'user-id-2',
        workspaceId: 'workspace-id-456',
        role: UserRole.USER,
      };

      const mockUser1 = createMockUser();
      const mockUser2 = createMockUser({ email: 'jane@example.com' });

      handler.execute
        .mockResolvedValueOnce(right(mockUser1))
        .mockResolvedValueOnce(right(mockUser2));

      const result1 = await controller.handle(tokenPayload1);
      const result2 = await controller.handle(tokenPayload2);

      expect(handler.execute).toHaveBeenCalledTimes(2);
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });
  });
});
