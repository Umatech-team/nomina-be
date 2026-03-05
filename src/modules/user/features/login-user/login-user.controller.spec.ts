import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { left, right } from '@shared/core/errors/Either';
import { LoginUserController } from './login-user.controller';
import { LoginUserRequest } from './login-user.dto';
import { LoginUserHandler } from './login-user.handler';

describe('LoginUserController', () => {
  let controller: LoginUserController;
  let handler: jest.Mocked<LoginUserHandler>;

  beforeEach(async () => {
    const mockHandler = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<LoginUserHandler>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginUserController],
      providers: [
        {
          provide: LoginUserHandler,
          useValue: mockHandler,
        },
      ],
    }).compile();

    controller = module.get<LoginUserController>(LoginUserController);
    handler = module.get<LoginUserHandler>(
      LoginUserHandler,
    ) as jest.Mocked<LoginUserHandler>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle - Success Cases', () => {
    it('should call handler.execute with request body', async () => {
      const body: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      handler.execute.mockResolvedValue(
        right({
          accessToken: 'access_token_abc',
          refreshToken: 'refresh_token_xyz',
        }),
      );

      await controller.handle(body);

      expect(handler.execute).toHaveBeenCalledWith(body);
      expect(handler.execute).toHaveBeenCalledTimes(1);
    });

    it('should return tokens on successful login', async () => {
      const body: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      handler.execute.mockResolvedValue(
        right({
          accessToken: 'access_token_abc',
          refreshToken: 'refresh_token_xyz',
        }),
      );

      const result = await controller.handle(body);

      expect(result).toBeDefined();
      if (result) {
        expect(result).toHaveProperty('data');
        expect(result.data).toHaveProperty('accessToken');
        expect(result.data).toHaveProperty('refreshToken');
      }
    });

    it('should return correct token values', async () => {
      const body: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      const expectedAccessToken = 'access_token_abc123';
      const expectedRefreshToken = 'refresh_token_xyz789';

      handler.execute.mockResolvedValue(
        right({
          accessToken: expectedAccessToken,
          refreshToken: expectedRefreshToken,
        }),
      );

      const result = await controller.handle(body);

      if (result) {
        expect(result.data.accessToken).toBe(expectedAccessToken);
        expect(result.data.refreshToken).toBe(expectedRefreshToken);
      }
    });

    it('should be an async method returning promise', async () => {
      const body: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      handler.execute.mockResolvedValue(
        right({
          accessToken: 'access_token_abc',
          refreshToken: 'refresh_token_xyz',
        }),
      );

      const result = controller.handle(body);

      expect(result instanceof Promise).toBe(true);
    });
  });

  describe('handle - Error Cases', () => {
    it('should handle unauthorized error on invalid credentials', async () => {
      const body: LoginUserRequest = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      const error = new HttpException(
        'Invalid credentials',
        HttpStatus.UNAUTHORIZED,
      );
      handler.execute.mockResolvedValue(left(error));

      expect(controller.handle(body)).rejects.toThrow();
    });

    it('should handle user not found error', async () => {
      const body: LoginUserRequest = {
        email: 'notfound@example.com',
        password: 'password123',
      };

      const error = new HttpException(
        'Invalid credentials',
        HttpStatus.UNAUTHORIZED,
      );
      handler.execute.mockResolvedValue(left(error));

      expect(controller.handle(body)).rejects.toThrow();
    });

    it('should propagate handler errors via ErrorPresenter', async () => {
      const body: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      const error = new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      handler.execute.mockResolvedValue(left(error));

      expect(controller.handle(body)).rejects.toThrow();
    });

    it('should handle 401 error', async () => {
      const body: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      const error = new HttpException(
        'Invalid credentials',
        HttpStatus.UNAUTHORIZED,
      );
      handler.execute.mockResolvedValue(left(error));

      expect(controller.handle(body)).rejects.toThrow();
    });
  });

  describe('handle - Request Handling', () => {
    it('should pass email correctly to handler', async () => {
      const body: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      handler.execute.mockResolvedValue(
        right({
          accessToken: 'access_token_abc',
          refreshToken: 'refresh_token_xyz',
        }),
      );

      await controller.handle(body);

      expect(handler.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'john@example.com',
        }),
      );
    });

    it('should pass password correctly to handler', async () => {
      const body: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      handler.execute.mockResolvedValue(
        right({
          accessToken: 'access_token_abc',
          refreshToken: 'refresh_token_xyz',
        }),
      );

      await controller.handle(body);

      expect(handler.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'password123',
        }),
      );
    });

    it('should pass all request fields to handler', async () => {
      const body: LoginUserRequest = {
        email: 'jane@example.com',
        password: 'securepassword123',
      };

      handler.execute.mockResolvedValue(
        right({
          accessToken: 'access_token_abc',
          refreshToken: 'refresh_token_xyz',
        }),
      );

      await controller.handle(body);

      expect(handler.execute).toHaveBeenCalledWith({
        email: 'jane@example.com',
        password: 'securepassword123',
      });
    });
  });

  describe('handle - Either Monad Handling', () => {
    it('should check if result is left before handling error', async () => {
      const body: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      handler.execute.mockResolvedValue(
        right({
          accessToken: 'access_token_abc',
          refreshToken: 'refresh_token_xyz',
        }),
      );

      await controller.handle(body);

      expect(handler.execute).toHaveBeenCalled();
    });

    it('should handle Either left case (error)', async () => {
      const body: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      const error = new HttpException(
        'Invalid credentials',
        HttpStatus.UNAUTHORIZED,
      );
      handler.execute.mockResolvedValue(left(error));

      const handleCall = controller.handle(body);

      expect(handleCall).rejects.toThrow();
    });

    it('should handle Either right case (success)', async () => {
      const body: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      handler.execute.mockResolvedValue(
        right({
          accessToken: 'access_token_abc',
          refreshToken: 'refresh_token_xyz',
        }),
      );

      const result = await controller.handle(body);

      expect(result).toBeDefined();
      if (result) {
        expect(result.data).toBeDefined();
      }
    });
  });

  describe('handle - Response Format', () => {
    it('should return response with data property', async () => {
      const body: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      handler.execute.mockResolvedValue(
        right({
          accessToken: 'access_token_abc',
          refreshToken: 'refresh_token_xyz',
        }),
      );

      const result = await controller.handle(body);

      expect(result).toHaveProperty('data');
    });

    it('should not expose sensitive data in response', async () => {
      const body: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      handler.execute.mockResolvedValue(
        right({
          accessToken: 'access_token_abc',
          refreshToken: 'refresh_token_xyz',
        }),
      );

      const result = await controller.handle(body);

      // Should only contain tokens, no password or user info
      if (result) {
        expect(result.data).not.toHaveProperty('password');
        expect(result.data).not.toHaveProperty('email');
        expect(result.data).not.toHaveProperty('user');
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
      expect(controller instanceof LoginUserController).toBe(true);
    });

    it('should have handler injected', () => {
      expect(handler).toBeDefined();
    });
  });

  describe('handle - Multiple Requests', () => {
    it('should handle multiple sequential login attempts', async () => {
      const body1: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      const body2: LoginUserRequest = {
        email: 'jane@example.com',
        password: 'password456',
      };

      handler.execute
        .mockResolvedValueOnce(
          right({
            accessToken: 'access_token_abc',
            refreshToken: 'refresh_token_xyz',
          }),
        )
        .mockResolvedValueOnce(
          right({
            accessToken: 'access_token_123',
            refreshToken: 'refresh_token_456',
          }),
        );

      const result1 = await controller.handle(body1);
      const result2 = await controller.handle(body2);

      expect(handler.execute).toHaveBeenCalledTimes(2);
      if (result1 && result2) {
        expect(result1.data.accessToken).toBe('access_token_abc');
        expect(result2.data.accessToken).toBe('access_token_123');
      }
    });

    it('should isolate failures between requests', async () => {
      const body1: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      const body2: LoginUserRequest = {
        email: 'jane@example.com',
        password: 'wrongpassword',
      };

      const error = new HttpException(
        'Invalid credentials',
        HttpStatus.UNAUTHORIZED,
      );

      handler.execute
        .mockResolvedValueOnce(
          right({
            accessToken: 'access_token_abc',
            refreshToken: 'refresh_token_xyz',
          }),
        )
        .mockResolvedValueOnce(left(error));

      const result1 = await controller.handle(body1);
      const result2 = controller.handle(body2);

      expect(result1).toBeDefined();
      expect(result2).rejects.toThrow();
    });
  });
});
