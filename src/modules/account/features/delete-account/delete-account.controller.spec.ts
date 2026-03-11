import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { left, right } from '@shared/core/errors/Either';
import { DeleteAccountController } from './delete-account.controller';
import { DeleteAccountRequest } from './delete-account.dto';
import { DeleteAccountHandler } from './delete-account.handler';

const WORKSPACE_ID = 'workspace-id-abc';
const ACCOUNT_ID = '123e4567-e89b-12d3-a456-426614174000';

const tokenPayload = {
  workspaceId: WORKSPACE_ID,
  sub: 'user-id',
} as TokenPayloadSchema;
const params: DeleteAccountRequest = { accountId: ACCOUNT_ID };

describe('DeleteAccountController', () => {
  let controller: DeleteAccountController;
  let handler: jest.Mocked<DeleteAccountHandler>;

  beforeEach(async () => {
    const mockHandler = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<DeleteAccountHandler>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeleteAccountController],
      providers: [{ provide: DeleteAccountHandler, useValue: mockHandler }],
    }).compile();

    controller = module.get<DeleteAccountController>(DeleteAccountController);
    handler = module.get<DeleteAccountHandler>(
      DeleteAccountHandler,
    ) as jest.Mocked<DeleteAccountHandler>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle – Success Cases', () => {
    it('should call handler.execute with accountId and workspaceId from token', async () => {
      handler.execute.mockResolvedValue(right(null));

      await controller.handle(tokenPayload, params);

      expect(handler.execute).toHaveBeenCalledWith({
        accountId: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
      });
      expect(handler.execute).toHaveBeenCalledTimes(1);
    });

    it('should return undefined on successful deletion (no content)', async () => {
      handler.execute.mockResolvedValue(right(null));

      const result = await controller.handle(tokenPayload, params);

      expect(result).toBeUndefined();
    });
  });

  describe('handle – Error Cases', () => {
    it('should throw when handler returns Left(403) (ownership violation)', async () => {
      handler.execute.mockResolvedValue(
        left(
          new HttpException(
            'You do not have permission to delete this account or it does not exist',
            HttpStatus.FORBIDDEN,
          ),
        ),
      );

      await expect(controller.handle(tokenPayload, params)).rejects.toThrow();
    });

    it('should throw when handler returns Left(404) (not found)', async () => {
      handler.execute.mockResolvedValue(
        left(new HttpException('Account not found', HttpStatus.NOT_FOUND)),
      );

      await expect(controller.handle(tokenPayload, params)).rejects.toThrow();
    });

    it('should call handler exactly once even on error', async () => {
      handler.execute.mockResolvedValue(
        left(new HttpException('Forbidden', HttpStatus.FORBIDDEN)),
      );

      try {
        await controller.handle(tokenPayload, params);
      } catch {
        // expected
      }

      expect(handler.execute).toHaveBeenCalledTimes(1);
    });
  });
});
