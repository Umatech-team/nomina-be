import { User } from '@modules/user/entities/User';
import { EmailAlreadyInUseError } from '@modules/user/errors';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import { HashGenerator } from '@providers/cryptography/contracts/HashGenerator';
import { CreateUserService } from './create-user.service';

function makeUser(): User {
  const result = User.create(
    { name: 'John Doe', email: 'john@example.com', passwordHash: 'hash' },
    'user-1',
  );
  if (result.isLeft()) throw result.value;
  return result.value;
}

function makeRequest(overrides = {}) {
  return {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    ...overrides,
  };
}

describe('CreateUserService', () => {
  let service: CreateUserService;
  let userRepository: jest.Mocked<UserRepository>;
  let hashGenerator: jest.Mocked<HashGenerator>;

  beforeEach(() => {
    userRepository = {
      findUniqueByEmail: jest.fn(),
      create: jest.fn(),
      findUniqueById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<UserRepository>;

    hashGenerator = {
      hash: jest.fn().mockResolvedValue('hashed_password'),
    } as jest.Mocked<HashGenerator>;

    service = new CreateUserService(userRepository, hashGenerator);
  });

  afterEach(() => jest.clearAllMocks());

  it('should return left(EmailAlreadyInUseError) when email is already registered', async () => {
    userRepository.findUniqueByEmail.mockResolvedValue(makeUser());

    const result = await service.execute(makeRequest());
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(EmailAlreadyInUseError);
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it('should create user and return right on success', async () => {
    userRepository.findUniqueByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue();

    const result = await service.execute(makeRequest());
    expect(result.isRight()).toBe(true);
    expect(hashGenerator.hash).toHaveBeenCalledWith('password123');
    expect(userRepository.create).toHaveBeenCalledTimes(1);
  });
});
