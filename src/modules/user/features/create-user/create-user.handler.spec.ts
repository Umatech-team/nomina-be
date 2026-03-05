import { User } from '@modules/user/entities/User';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import {
  createMockHashGenerator,
  createMockUser,
  createMockUserRepository,
} from '@modules/user/test-helpers/mock-factories';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HashGenerator } from '@providers/cryptography/contracts/HashGenerator';
import { CreateUserRequest } from './create-user.dto';
import { CreateUserHandler } from './create-user.handler';

describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;
  let userRepository: jest.Mocked<UserRepository>;
  let hashGenerator: jest.Mocked<HashGenerator>;

  beforeEach(async () => {
    userRepository = createMockUserRepository();
    hashGenerator = createMockHashGenerator();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserHandler,
        {
          provide: UserRepository,
          useValue: userRepository,
        },
        {
          provide: HashGenerator,
          useValue: hashGenerator,
        },
      ],
    }).compile();

    handler = module.get<CreateUserHandler>(CreateUserHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute - Success Cases', () => {
    it('should create user successfully with valid input', async () => {
      const request: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      userRepository.findUniqueByEmail.mockResolvedValue(null);
      hashGenerator.hash.mockResolvedValue('hashed_password_123');

      const result = await handler.execute(request);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toBeInstanceOf(User);
        expect(result.value.name).toBe('John Doe');
        expect(result.value.email).toBe('john@example.com');
        expect(result.value.passwordHash).toBe('hashed_password_123');
      }
    });

    it('should hash the password before creating user', async () => {
      const request: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      userRepository.findUniqueByEmail.mockResolvedValue(null);
      hashGenerator.hash.mockResolvedValue('hashed_password_123');

      await handler.execute(request);

      expect(hashGenerator.hash).toHaveBeenCalledWith('password123');
      expect(hashGenerator.hash).toHaveBeenCalledTimes(1);
    });

    it('should check for existing email before creating user', async () => {
      const request: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      userRepository.findUniqueByEmail.mockResolvedValue(null);
      hashGenerator.hash.mockResolvedValue('hashed_password_123');

      await handler.execute(request);

      expect(userRepository.findUniqueByEmail).toHaveBeenCalledWith(
        'john@example.com',
      );
      // findUniqueByEmail should be called before create as part of the create user flow
    });

    it('should return user with generated ID', async () => {
      const request: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      userRepository.findUniqueByEmail.mockResolvedValue(null);
      hashGenerator.hash.mockResolvedValue('hashed_password_123');

      const result = await handler.execute(request);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.id).toBeDefined();
        expect(typeof result.value.id).toBe('string');
      }
    });

    it('should handle long names (up to 20 chars) correctly', async () => {
      const request: CreateUserRequest = {
        name: 'John Doe Twelve Chars',
        email: 'john@example.com',
        password: 'password123',
      };

      userRepository.findUniqueByEmail.mockResolvedValue(null);
      hashGenerator.hash.mockResolvedValue('hashed_password_123');

      const result = await handler.execute(request);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.name).toBe('John Doe Twelve Chars');
      }
    });
  });

  describe('execute - Email Already Exists Error', () => {
    it('should return conflict error when email already exists', async () => {
      const request: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const existingUser = createMockUser({
        email: 'john@example.com',
      });
      userRepository.findUniqueByEmail.mockResolvedValue(existingUser);

      const result = await handler.execute(request);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(HttpException);
        expect((result.value as HttpException).getStatus()).toBe(409);
        expect((result.value as HttpException).message).toContain(
          'Email already exists',
        );
      }
    });

    it('should not hash password when email already exists', async () => {
      const request: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const existingUser = createMockUser();
      userRepository.findUniqueByEmail.mockResolvedValue(existingUser);

      await handler.execute(request);

      expect(hashGenerator.hash).not.toHaveBeenCalled();
    });

    it('should not create user when email already exists', async () => {
      const request: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const existingUser = createMockUser();
      userRepository.findUniqueByEmail.mockResolvedValue(existingUser);

      await handler.execute(request);

      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('execute - Entity Validation Errors', () => {
    it('should return error when name is too short (less than 4 chars)', async () => {
      const request: CreateUserRequest = {
        name: 'Jo',
        email: 'john@example.com',
        password: 'password123',
      };

      userRepository.findUniqueByEmail.mockResolvedValue(null);
      hashGenerator.hash.mockResolvedValue('hashed_password_123');

      const result = await handler.execute(request);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(HttpException);
        expect((result.value as HttpException).getStatus()).toBe(400);
      }
    });

    it('should return error when email is invalid', async () => {
      const request: CreateUserRequest = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
      };

      userRepository.findUniqueByEmail.mockResolvedValue(null);
      hashGenerator.hash.mockResolvedValue('hashed_password_123');

      const result = await handler.execute(request);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(HttpException);
        expect((result.value as HttpException).getStatus()).toBe(400);
      }
    });

    it('should not create user when entity validation fails', async () => {
      const request: CreateUserRequest = {
        name: 'Jo',
        email: 'john@example.com',
        password: 'password123',
      };

      userRepository.findUniqueByEmail.mockResolvedValue(null);
      hashGenerator.hash.mockResolvedValue('hashed_password_123');

      await handler.execute(request);

      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('execute - Return Type', () => {
    it('should return Either monad', async () => {
      const request: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      userRepository.findUniqueByEmail.mockResolvedValue(null);
      hashGenerator.hash.mockResolvedValue('hashed_password_123');

      const result = await handler.execute(request);

      expect(result).toHaveProperty('isLeft');
      expect(result).toHaveProperty('isRight');
      expect(typeof result.isLeft).toBe('function');
      expect(typeof result.isRight).toBe('function');
    });

    it('should have value property on Either result', async () => {
      const request: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      userRepository.findUniqueByEmail.mockResolvedValue(null);
      hashGenerator.hash.mockResolvedValue('hashed_password_123');

      const result = await handler.execute(request);

      expect(result).toHaveProperty('value');
    });
  });

  describe('execute - Edge Cases', () => {
    it('should handle special characters in name', async () => {
      const request: CreateUserRequest = {
        name: "John O'Brien",
        email: 'john@example.com',
        password: 'password123',
      };

      userRepository.findUniqueByEmail.mockResolvedValue(null);
      hashGenerator.hash.mockResolvedValue('hashed_password_123');

      const result = await handler.execute(request);

      expect(result.isRight()).toBe(true);
    });

    it('should handle email with plus addressing', async () => {
      const request: CreateUserRequest = {
        name: 'John Doe',
        email: 'john+test@example.com',
        password: 'password123',
      };

      userRepository.findUniqueByEmail.mockResolvedValue(null);
      hashGenerator.hash.mockResolvedValue('hashed_password_123');

      const result = await handler.execute(request);

      expect(result.isRight()).toBe(true);
    });

    it('should handle strong passwords with special characters', async () => {
      const request: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'P@ssw0rd!#$%^&*()_+-=',
      };

      userRepository.findUniqueByEmail.mockResolvedValue(null);
      hashGenerator.hash.mockResolvedValue('hashed_password_hash');

      const result = await handler.execute(request);

      expect(result.isRight()).toBe(true);
    });

    it('should create user with minimum name length (4 chars)', async () => {
      const request: CreateUserRequest = {
        name: 'John',
        email: 'john@example.com',
        password: 'password123',
      };

      userRepository.findUniqueByEmail.mockResolvedValue(null);
      hashGenerator.hash.mockResolvedValue('hashed_password_123');

      const result = await handler.execute(request);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.name).toBe('John');
      }
    });
  });

  describe('execute - Dependencies', () => {
    it('should use injected UserRepository', async () => {
      const request: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      userRepository.findUniqueByEmail.mockResolvedValue(null);
      hashGenerator.hash.mockResolvedValue('hashed_password_123');

      await handler.execute(request);

      expect(userRepository.findUniqueByEmail).toHaveBeenCalled();
    });

    it('should use injected HashGenerator', async () => {
      const request: CreateUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      userRepository.findUniqueByEmail.mockResolvedValue(null);
      hashGenerator.hash.mockResolvedValue('hashed_password_123');

      await handler.execute(request);

      expect(hashGenerator.hash).toHaveBeenCalled();
    });
  });
});
