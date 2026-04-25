import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { left, right } from '@shared/core/errors/Either';
import { RefreshTokenController } from './refresh-token.controller';
import { RefreshTokenService } from './refresh-token.service';

describe('RefreshTokenController', () => {
  let controller: RefreshTokenController;
  let service: jest.Mocked<RefreshTokenService>;

  const makeToken = () => 'valid_refresh_token_123';

  beforeEach(async () => {
    const mockService = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefreshTokenController],
      providers: [{ provide: RefreshTokenService, useValue: mockService }],
    }).compile();

    controller = module.get<RefreshTokenController>(RefreshTokenController);
    service = module.get(RefreshTokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle()', () => {
    it('should route request to service and return formatted tokens on success (Right)', async () => {
      const token = makeToken();
      const newTokens = {
        accessToken: 'new_access_abc',
        refreshToken: 'new_refresh_xyz',
      };
      service.execute.mockResolvedValue(right(newTokens));
      const result = await controller.handle(token);
      expect(service.execute).toHaveBeenCalledTimes(1);
      expect(service.execute).toHaveBeenCalledWith(token);
      expect(result).toEqual({ data: newTokens });
    });

    it.each([
      [
        'Unauthorized - Session Expired (401)',
        new HttpException('Session expired', HttpStatus.UNAUTHORIZED),
      ],
      [
        'Not Found - User not found (404)',
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      ],
      [
        'Internal Server Error (500)',
        new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR),
      ],
    ])(
      'should throw HTTP exception when service returns error %s (Left)',
      async (_, errorInstance) => {
        const token = makeToken();
        service.execute.mockResolvedValue(left(errorInstance));
        await expect(controller.handle(token)).rejects.toThrow(errorInstance);
        expect(service.execute).toHaveBeenCalledWith(token);
      },
    );
  });
});
