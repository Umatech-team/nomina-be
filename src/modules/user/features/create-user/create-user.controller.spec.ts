import { createMockUser } from '@modules/user/test-helpers/mock-factories';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { left, right } from '@shared/core/errors/Either';
import { CreateUserController } from './create-user.controller';
import { CreateUserRequest } from './create-user.dto';
import { CreateUserService } from './create-user.service';

describe('CreateUserController', () => {
  let controller: CreateUserController;
  let service: jest.Mocked<CreateUserService>;

  const makeRequest = (
    overrides?: Partial<CreateUserRequest>,
  ): CreateUserRequest => ({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    ...overrides,
  });

  beforeEach(async () => {
    const mockService = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateUserController],
      providers: [
        {
          provide: CreateUserService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CreateUserController>(CreateUserController);
    service = module.get(CreateUserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle()', () => {
    it('should route request to service and return void on success (Right)', async () => {
      const request = makeRequest();
      service.execute.mockResolvedValue(right(createMockUser()));

      const result = await controller.handle(request);

      expect(service.execute).toHaveBeenCalledTimes(1);
      expect(service.execute).toHaveBeenCalledWith(request);
      expect(result).toBeUndefined();
    });

    it.each([
      [
        'Conflict (409)',
        new HttpException('Email exists', HttpStatus.CONFLICT),
      ],
      [
        'Bad Request (400)',
        new HttpException('Validation failed', HttpStatus.BAD_REQUEST),
      ],
      [
        'Internal Server Error (500)',
        new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR),
      ],
    ])(
      'should throw HTTP exception when service returns error %s (Left)',
      async (_, errorInstance) => {
        const request = makeRequest();
        service.execute.mockResolvedValue(left(errorInstance));
        await expect(controller.handle(request)).rejects.toThrow(errorInstance);
        expect(service.execute).toHaveBeenCalledWith(request);
      },
    );
  });
});
