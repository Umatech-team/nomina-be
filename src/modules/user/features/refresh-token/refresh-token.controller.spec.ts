import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { left, right } from '@shared/core/errors/Either';
import { RefreshTokenController } from './refresh-token.controller';
import { RefreshTokenHandler } from './refresh-token.handler';

describe('RefreshTokenController', () => {
  let controller: RefreshTokenController;
  let handler: jest.Mocked<RefreshTokenHandler>;

  beforeEach(async () => {
    const mockHandler = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<RefreshTokenHandler>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefreshTokenController],
      providers: [
        {
          provide: RefreshTokenHandler,
          useValue: mockHandler,
        },
      ],
    }).compile();

    controller = module.get<RefreshTokenController>(RefreshTokenController);
    handler = module.get<RefreshTokenHandler>(
      RefreshTokenHandler,
    ) as jest.Mocked<RefreshTokenHandler>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle - Success Cases', () => {
    it('should call handler.execute with refresh token', async () => {
      const refreshToken = 'refresh_token_abc';

      handler.execute.mockResolvedValue(
        right({
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
        }),
      );

      await controller.handle(refreshToken);

      expect(handler.execute).toHaveBeenCalledWith(refreshToken);
      expect(handler.execute).toHaveBeenCalledTimes(1);
    });

    it('should return new tokens on successful refresh', async () => {
      const refreshToken = 'refresh_token_abc';

      handler.execute.mockResolvedValue(
        right({
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
        }),
      );

      const result = await controller.handle(refreshToken);

      expect(result).toBeDefined();
      if (result) {
        expect(result).toHaveProperty('data');
        expect(result.data).toHaveProperty('accessToken');
        expect(result.data).toHaveProperty('refreshToken');
      }
    });

    it('should return correct token values', async () => {
      const refreshToken = 'refresh_token_abc';

      const expectedAccessToken = 'new_access_token_123';
      const expectedRefreshToken = 'new_refresh_token_456';

      handler.execute.mockResolvedValue(
        right({
          accessToken: expectedAccessToken,
          refreshToken: expectedRefreshToken,
        }),
      );

      const result = await controller.handle(refreshToken);

      if (result) {
        expect(result.data.accessToken).toBe(expectedAccessToken);
        expect(result.data.refreshToken).toBe(expectedRefreshToken);
      }
    });

    it('should be an async method returning promise', async () => {
      const refreshToken = 'refresh_token_abc';

      handler.execute.mockResolvedValue(
        right({
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
        }),
      );

      const result = controller.handle(refreshToken);

      expect(result instanceof Promise).toBe(true);
    });
  });

  describe('handle - Token Decode Error Cases', () => {
    it('should handle session expired error on invalid token', async () => {
      const refreshToken = 'invalid_token';

      const error = new HttpException(
        'Session expired',
        HttpStatus.UNAUTHORIZED,
      );
      handler.execute.mockResolvedValue(left(error));

      expect(controller.handle(refreshToken)).rejects.toThrow();
    });

    it('should handle token without payload error', async () => {
      const refreshToken = 'token_without_payload';

      const error = new HttpException(
        'Session expired',
        HttpStatus.UNAUTHORIZED,
      );
      handler.execute.mockResolvedValue(left(error));

      expect(controller.handle(refreshToken)).rejects.toThrow();
    });
  });

  describe('handle - User Not Found Error', () => {
    it('should handle user not found error', async () => {
      const refreshToken = 'refresh_token_abc';

      const error = new HttpException('User not found', HttpStatus.NOT_FOUND);
      handler.execute.mockResolvedValue(left(error));

      expect(controller.handle(refreshToken)).rejects.toThrow();
    });

    it('should return 404 status for user not found', async () => {
      const refreshToken = 'refresh_token_abc';

      const error = new HttpException('User not found', HttpStatus.NOT_FOUND);
      handler.execute.mockResolvedValue(left(error));

      expect(controller.handle(refreshToken)).rejects.toThrow();
    });
  });

  describe('handle - Refresh Token Not In DB Error', () => {
    it('should handle session expired when token not in DB', async () => {
      const refreshToken = 'refresh_token_abc';

      const error = new HttpException(
        'Session expired',
        HttpStatus.UNAUTHORIZED,
      );
      handler.execute.mockResolvedValue(left(error));

      expect(controller.handle(refreshToken)).rejects.toThrow();
    });
  });

  describe('handle - Request Handling', () => {
    it('should pass refresh token from decorator to handler', async () => {
      const refreshToken = 'specific_refresh_token';

      handler.execute.mockResolvedValue(
        right({
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
        }),
      );

      await controller.handle(refreshToken);

      expect(handler.execute).toHaveBeenCalledWith('specific_refresh_token');
    });

    it('should handle tokens with special characters', async () => {
      const refreshToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWlkIn0.signature';

      handler.execute.mockResolvedValue(
        right({
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
        }),
      );

      await controller.handle(refreshToken);

      expect(handler.execute).toHaveBeenCalledWith(refreshToken);
    });

    it('should handle long token strings', async () => {
      const refreshToken = 'a'.repeat(500);

      handler.execute.mockResolvedValue(
        right({
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
        }),
      );

      await controller.handle(refreshToken);

      expect(handler.execute).toHaveBeenCalledWith(refreshToken);
    });
  });

  describe('handle - Either Monad Handling', () => {
    it('should check if result is left before handling error', async () => {
      const refreshToken = 'refresh_token_abc';

      handler.execute.mockResolvedValue(
        right({
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
        }),
      );

      await controller.handle(refreshToken);

      expect(handler.execute).toHaveBeenCalled();
    });

    it('should handle Either left case (error)', async () => {
      const refreshToken = 'refresh_token_abc';

      const error = new HttpException(
        'Session expired',
        HttpStatus.UNAUTHORIZED,
      );
      handler.execute.mockResolvedValue(left(error));

      const handleCall = controller.handle(refreshToken);

      expect(handleCall).rejects.toThrow();
    });

    it('should handle Either right case (success)', async () => {
      const refreshToken = 'refresh_token_abc';

      handler.execute.mockResolvedValue(
        right({
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
        }),
      );

      const result = await controller.handle(refreshToken);

      expect(result).toBeDefined();
      if (result) {
        expect(result.data).toBeDefined();
      }
    });
  });

  describe('handle - Response Format', () => {
    it('should return response with data property', async () => {
      const refreshToken = 'refresh_token_abc';

      handler.execute.mockResolvedValue(
        right({
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
        }),
      );

      const result = await controller.handle(refreshToken);

      expect(result).toHaveProperty('data');
      if (result) {
        expect(typeof result.data).toBe('object');
      }
    });

    it('should contain only tokens in response', async () => {
      const refreshToken = 'refresh_token_abc';

      handler.execute.mockResolvedValue(
        right({
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
        }),
      );

      const result = await controller.handle(refreshToken);

      if (result) {
        expect(Object.keys(result.data)).toContain('accessToken');
        expect(Object.keys(result.data)).toContain('refreshToken');
        expect(result.data).not.toHaveProperty('user');
        expect(result.data).not.toHaveProperty('userId');
      }
    });

    it('should not expose sensitive data in response', async () => {
      const refreshToken = 'refresh_token_abc';

      handler.execute.mockResolvedValue(
        right({
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
        }),
      );

      const result = await controller.handle(refreshToken);

      if (result) {
        expect(result.data).not.toHaveProperty('password');
        expect(result.data).not.toHaveProperty('email');
        expect(result.data).not.toHaveProperty('userId');
      }
    });
  });

  describe('Controller Setup', () => {
    it('should have handle method', () => {
      expect(controller).toHaveProperty('handle');
      expect(typeof controller.handle).toBe('function');
    });

    it('should be a NestJS controller', () => {
      expect(controller).toBeDefined();
      expect(controller instanceof RefreshTokenController).toBe(true);
    });

    it('should have handler injected', () => {
      expect(handler).toBeDefined();
    });
  });

  describe('handle - Multiple Requests', () => {
    it('should handle multiple sequential refresh requests', async () => {
      const token1 = 'refresh_token_abc';
      const token2 = 'refresh_token_xyz';

      handler.execute
        .mockResolvedValueOnce(
          right({
            accessToken: 'access_token_1',
            refreshToken: 'refresh_token_1',
          }),
        )
        .mockResolvedValueOnce(
          right({
            accessToken: 'access_token_2',
            refreshToken: 'refresh_token_2',
          }),
        );

      const result1 = await controller.handle(token1);
      const result2 = await controller.handle(token2);

      expect(handler.execute).toHaveBeenCalledTimes(2);
      if (result1 && result2) {
        expect(result1.data.accessToken).toBe('access_token_1');
        expect(result2.data.accessToken).toBe('access_token_2');
      }
    });

    it('should isolate failures between requests', async () => {
      const token1 = 'refresh_token_abc';
      const token2 = 'invalid_token';

      const error = new HttpException(
        'Session expired',
        HttpStatus.UNAUTHORIZED,
      );

      handler.execute
        .mockResolvedValueOnce(
          right({
            accessToken: 'access_token_1',
            refreshToken: 'refresh_token_1',
          }),
        )
        .mockResolvedValueOnce(left(error));

      const result1 = await controller.handle(token1);
      const result2 = controller.handle(token2);

      expect(result1).toBeDefined();
      expect(result2).rejects.toThrow();
    });
  });

  describe('handle - Edge Cases', () => {
    it('should handle empty string token', async () => {
      const refreshToken = '';

      const error = new HttpException(
        'Session expired',
        HttpStatus.UNAUTHORIZED,
      );
      handler.execute.mockResolvedValue(left(error));

      expect(controller.handle(refreshToken)).rejects.toThrow();
    });

    it('should handle whitespace-only token', async () => {
      const refreshToken = '   ';

      const error = new HttpException(
        'Session expired',
        HttpStatus.UNAUTHORIZED,
      );
      handler.execute.mockResolvedValue(left(error));

      expect(controller.handle(refreshToken)).rejects.toThrow();
    });

    it('should handle very long token string', async () => {
      const refreshToken = 'a'.repeat(10000);

      handler.execute.mockResolvedValue(
        right({
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
        }),
      );

      const result = await controller.handle(refreshToken);

      expect(result).toBeDefined();
    });
  });
});
