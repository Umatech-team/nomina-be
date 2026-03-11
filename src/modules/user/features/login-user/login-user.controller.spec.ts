import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { left, right } from '@shared/core/errors/Either';
import { LoginUserController } from './login-user.controller';
import { LoginUserRequest } from './login-user.dto';
import { LoginUserHandler } from './login-user.handler';

describe('LoginUserController', () => {
  let controller: LoginUserController;
  let handler: jest.Mocked<LoginUserHandler>;

  const makeRequest = (
    overrides?: Partial<LoginUserRequest>,
  ): LoginUserRequest => ({
    email: 'john@example.com',
    password: 'password123',
    ...overrides,
  });

  beforeEach(async () => {
    const mockHandler = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginUserController],
      providers: [{ provide: LoginUserHandler, useValue: mockHandler }],
    }).compile();

    controller = module.get<LoginUserController>(LoginUserController);
    handler = module.get(LoginUserHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle()', () => {
    it('should route request to handler and return formatted tokens on success (Right)', async () => {
      const request = makeRequest();
      const tokens = { accessToken: 'access_abc', refreshToken: 'refresh_xyz' };
      handler.execute.mockResolvedValue(right(tokens));
      const result = await controller.handle(request);
      expect(handler.execute).toHaveBeenCalledTimes(1);
      expect(handler.execute).toHaveBeenCalledWith(request);
      expect(result).toEqual({ data: tokens });
    });

    it.each([
      [
        'Unauthorized (401)',
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
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
      'should throw HTTP exception when handler returns error %s (Left)',
      async (_, errorInstance) => {
        const request = makeRequest();
        handler.execute.mockResolvedValue(left(errorInstance));
        await expect(controller.handle(request)).rejects.toThrow(errorInstance);
        expect(handler.execute).toHaveBeenCalledWith(request);
      },
    );
  });
});
