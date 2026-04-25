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
import { CreateUserService } from './create-user.service';

describe('CreateUserService', () => {
  let service: CreateUserService;
  let userRepository: jest.Mocked<UserRepository>;
  let hashGenerator: jest.Mocked<HashGenerator>;

  const makeRequest = (
    overrides?: Partial<CreateUserRequest>,
  ): CreateUserRequest => ({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    ...overrides,
  });

  const arrangeSuccessMocks = () => {
    userRepository.findUniqueByEmail.mockResolvedValue(null);
    hashGenerator.hash.mockResolvedValue('hashed_password_123');
  };

  beforeEach(async () => {
    userRepository = createMockUserRepository();
    hashGenerator = createMockHashGenerator();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserService,
        { provide: UserRepository, useValue: userRepository },
        { provide: HashGenerator, useValue: hashGenerator },
      ],
    }).compile();

    service = module.get<CreateUserService>(CreateUserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute - Happy Path', () => {
    beforeEach(() => arrangeSuccessMocks());

    it('should orchestrate user creation successfully', async () => {
      const request = makeRequest();
      const result = await service.execute(request);

      expect(result.isRight()).toBe(true);

      const user = result.value as User;
      expect(user).toBeInstanceOf(User);
      expect(user.name).toBe(request.name);
      expect(user.passwordHash).toBe('hashed_password_123');

      expect(userRepository.findUniqueByEmail).toHaveBeenCalledWith(
        request.email,
      );
      expect(hashGenerator.hash).toHaveBeenCalledWith(request.password);
      expect(userRepository.create).toHaveBeenCalled(); // Supondo que o service chama o create
    });
  });

  describe('execute - Exception Paths', () => {
    it('should return Conflict Error (409) when email already exists', async () => {
      userRepository.findUniqueByEmail.mockResolvedValue(createMockUser());

      const result = await service.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      const error = result.value as HttpException;
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(409);
      expect(error.message).toContain('Email already exists');

      expect(hashGenerator.hash).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should return Bad Request (400) when Entity validation fails', async () => {
      arrangeSuccessMocks();

      const result = await service.execute(makeRequest({ name: 'Jo' }));

      expect(result.isLeft()).toBe(true);
      const error = result.value as HttpException;
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(400);
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });
});
