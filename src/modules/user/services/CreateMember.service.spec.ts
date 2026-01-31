import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { Test, TestingModule } from '@nestjs/testing';
import { HashGenerator } from '@providers/cryptography/contracts/HashGenerator';
import { CreateUserDTO } from '../dto/CreateUserDTO';
import { User } from '../entities/User';
import { EmailAlreadyExistsError } from '../errors/EmailAlreadyExistsError';
import { UserRepository } from '../repositories/contracts/UserRepository';
import { CreateUserService } from './CreateUser.service';

describe('CreateUserService', () => {
  let service: CreateUserService;
  let userRepository: UserRepository;
  let transactionRepository: TransactionRepository;
  let hashGenerator: HashGenerator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserService,
        {
          provide: UserRepository,
          useValue: {
            findUniqueByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: TransactionRepository,
          useValue: {
            updateMonthlySummary: jest.fn(),
          },
        },
        {
          provide: HashGenerator,
          useValue: {
            hash: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CreateUserService>(CreateUserService);
    userRepository = module.get<UserRepository>(UserRepository);
    transactionRepository = module.get<TransactionRepository>(
      TransactionRepository,
    );
    hashGenerator = module.get<HashGenerator>(HashGenerator);
  });

  it('should create a user', async () => {
    const dto: CreateUserDTO = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    };

    const createdUser = new User(
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'hashedPassword',
      },
      1,
    );

    jest
      .spyOn(userRepository, 'findUniqueByEmail')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(createdUser);
    jest.spyOn(hashGenerator, 'hash').mockResolvedValue('hashedPassword');
    jest.spyOn(userRepository, 'create').mockResolvedValue(undefined);
    jest
      .spyOn(transactionRepository, 'updateMonthlySummary')
      .mockResolvedValue(undefined);

    const result = await service.execute(dto);

    expect(result.isRight()).toBe(true);
    expect(transactionRepository.updateMonthlySummary).toHaveBeenCalledWith(
      1,
      expect.any(Date),
    );
  });

  it('should return an error if email already exists', async () => {
    const dto: CreateUserDTO = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    };

    jest.spyOn(userRepository, 'findUniqueByEmail').mockResolvedValue(
      new User({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      }),
    );

    const result = await service.execute(dto);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(EmailAlreadyExistsError);
  });
});
