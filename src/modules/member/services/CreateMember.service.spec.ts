import { Test, TestingModule } from '@nestjs/testing';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { HashGenerator } from '@providers/cryptography/contracts/HashGenerator';
import { CreateMemberDTO } from '../dto/CreateMemberDTO';
import { Member } from '../entities/Member';
import { EmailAlreadyExistsError } from '../errors/EmailAlreadyExistsError';
import { MemberRepository } from '../repositories/contracts/MemberRepository';
import { CreateMemberService } from './CreateMember.service';

describe('CreateMemberService', () => {
  let service: CreateMemberService;
  let memberRepository: MemberRepository;
  let transactionRepository: TransactionRepository;
  let hashGenerator: HashGenerator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateMemberService,
        {
          provide: MemberRepository,
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

    service = module.get<CreateMemberService>(CreateMemberService);
    memberRepository = module.get<MemberRepository>(MemberRepository);
    transactionRepository = module.get<TransactionRepository>(
      TransactionRepository,
    );
    hashGenerator = module.get<HashGenerator>(HashGenerator);
  });

  it('should create a member', async () => {
    const dto: CreateMemberDTO = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    };

    const createdMember = new Member(
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'hashedPassword',
      },
      1,
    );

    jest
      .spyOn(memberRepository, 'findUniqueByEmail')
      .mockResolvedValueOnce(null) // First call for email check
      .mockResolvedValueOnce(createdMember); // Second call after creation
    jest.spyOn(hashGenerator, 'hash').mockResolvedValue('hashedPassword');
    jest.spyOn(memberRepository, 'create').mockResolvedValue(undefined);
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
    const dto: CreateMemberDTO = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    };

    jest.spyOn(memberRepository, 'findUniqueByEmail').mockResolvedValue(
      new Member({
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
