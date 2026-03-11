import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { left, right } from '@shared/core/errors/Either';
import { RefreshTokenController } from './refresh-token.controller';
import { RefreshTokenHandler } from './refresh-token.handler';

describe('RefreshTokenController', () => {
  let controller: RefreshTokenController;
  let handler: jest.Mocked<RefreshTokenHandler>;

  const makeToken = () => 'valid_refresh_token_123';

  beforeEach(async () => {
    const mockHandler = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefreshTokenController],
      providers: [{ provide: RefreshTokenHandler, useValue: mockHandler }],
    }).compile();

    controller = module.get<RefreshTokenController>(RefreshTokenController);
    handler = module.get(RefreshTokenHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle()', () => {
    it('should route request to handler and return formatted tokens on success (Right)', async () => {
      const token = makeToken();
      const newTokens = {
        accessToken: 'new_access_abc',
        refreshToken: 'new_refresh_xyz',
      };
      handler.execute.mockResolvedValue(right(newTokens));
      const result = await controller.handle(token);
      expect(handler.execute).toHaveBeenCalledTimes(1);
      expect(handler.execute).toHaveBeenCalledWith(token);
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
      'should throw HTTP exception when handler returns error %s (Left)',
      async (_, errorInstance) => {
        const token = makeToken();
        handler.execute.mockResolvedValue(left(errorInstance));
        await expect(controller.handle(token)).rejects.toThrow(errorInstance);
        expect(handler.execute).toHaveBeenCalledWith(token);
      },
    );
  });
});
