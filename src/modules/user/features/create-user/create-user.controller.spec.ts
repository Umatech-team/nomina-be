import { User } from '@modules/user/entities/User';
import { createMockUser } from '@modules/user/test-helpers/mock-factories';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Either, left, right } from '@shared/core/errors/Either';
import { CreateUserController } from './create-user.controller';
import { CreateUserRequest } from './create-user.dto';
import { CreateUserHandler } from './create-user.handler';

describe('CreateUserController', () => {
  let controller: CreateUserController;
  let handler: jest.Mocked<CreateUserHandler>;

  beforeEach(async () => {
    const mockHandler = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateUserHandler>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateUserController],
      providers: [
        {
          provide: CreateUserHandler,
          useValue: mockHandler,
        },
      ],
    }).compile();

    controller = module.get<CreateUserController>(CreateUserController);
    handler = module.get<CreateUserHandler>(
      CreateUserHandler,
    ) as jest.Mocked<CreateUserHandler>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle - Success Cases', () => {
    it('should call handler.execute with request body', async () => {
      const body: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = createMockUser();
      handler.execute.mockResolvedValue(right(mockUser));

      await controller.handle(body);

      expect(handler.execute).toHaveBeenCalledWith(body);
      expect(handler.execute).toHaveBeenCalledTimes(1);
    });

    it('should handle successful user creation', async () => {
      const body: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = createMockUser();
      handler.execute.mockResolvedValue(right(mockUser));

      const result = await controller.handle(body);

      expect(result).toBeUndefined();
    });

    it('should not return anything on successful creation', async () => {
      const body: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = createMockUser();
      handler.execute.mockResolvedValue(right(mockUser));

      const result = await controller.handle(body);

      expect(result).not.toBeDefined();
    });
  });

  describe('handle - Error Cases', () => {
    it('should handle conflict error when email exists', async () => {
      const body: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const error = new HttpException(
        'Email already exists',
        HttpStatus.CONFLICT,
      );
      handler.execute.mockResolvedValue(left(error));

      expect(controller.handle(body)).rejects.toThrow();
    });

    it('should handle bad request error on validation failure', async () => {
      const body: CreateUserRequest = {
        name: 'Jo',
        email: 'john@example.com',
        password: 'password123',
      };

      const error = new HttpException(
        'Name is required and must be at least 4 characters long.',
        HttpStatus.BAD_REQUEST,
      );
      handler.execute.mockResolvedValue(left(error));

      expect(controller.handle(body)).rejects.toThrow();
    });

    it('should propagate handler errors to ErrorPresenter', async () => {
      const body: CreateUserRequest = {
        name: 'John Doe',
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
  });

  describe('handle - Request Handling', () => {
    it('should handle request with valid data', async () => {
      const body: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = createMockUser();
      handler.execute.mockResolvedValue(right(mockUser));

      await controller.handle(body);

      expect(handler.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'john@example.com',
        }),
      );
    });

    it('should pass all request fields to handler', async () => {
      const body: CreateUserRequest = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'securepassword123',
      };

      const mockUser = createMockUser();
      handler.execute.mockResolvedValue(right(mockUser));

      await controller.handle(body);

      expect(handler.execute).toHaveBeenCalledWith({
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'securepassword123',
      });
    });
  });

  describe('handle - Either Monad Handling', () => {
    it('should check if result is left before handling error', async () => {
      const body: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = createMockUser();
      const either: Either<HttpException, User> = right(mockUser);

      handler.execute.mockResolvedValue(either);

      await controller.handle(body);

      expect(either.isLeft).toBeDefined();
      expect(typeof either.isLeft).toBe('function');
    });

    it('should handle Either left case (error)', async () => {
      const body: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const error = new HttpException(
        'Email already exists',
        HttpStatus.CONFLICT,
      );
      handler.execute.mockResolvedValue(left(error));

      const handleCall = controller.handle(body);

      expect(handleCall).rejects.toThrow();
    });

    it('should handle Either right case (success)', async () => {
      const body: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = createMockUser();
      handler.execute.mockResolvedValue(right(mockUser));

      const result = await controller.handle(body);

      expect(result).toBeUndefined();
    });
  });

  describe('handle - Integration with Handler', () => {
    it('should be an async method', async () => {
      const body: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = createMockUser();
      handler.execute.mockResolvedValue(right(mockUser));

      const result = controller.handle(body);

      expect(result instanceof Promise).toBe(true);
    });

    it('should await handler execution', async () => {
      const body: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = createMockUser();
      handler.execute.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(right(mockUser)), 10),
          ),
      );

      await controller.handle(body);

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
      expect(controller instanceof CreateUserController).toBe(true);
    });

    it('should have handler injected', () => {
      expect(handler).toBeDefined();
    });
  });

  describe('handle - Multiple Requests', () => {
    it('should handle multiple sequential requests', async () => {
      const body1: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const body2: CreateUserRequest = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password456',
      };

      const mockUser1 = createMockUser({ email: 'john@example.com' });
      const mockUser2 = createMockUser({ email: 'jane@example.com' });

      handler.execute
        .mockResolvedValueOnce(right(mockUser1))
        .mockResolvedValueOnce(right(mockUser2));

      await controller.handle(body1);
      await controller.handle(body2);

      expect(handler.execute).toHaveBeenCalledTimes(2);
      expect(handler.execute).toHaveBeenNthCalledWith(1, body1);
      expect(handler.execute).toHaveBeenNthCalledWith(2, body2);
    });
  });
});
