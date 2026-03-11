import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { left, right } from '@shared/core/errors/Either';
import { DeleteRecurringTransactionController } from './delete-recurring-transaction.controller';
import { DeleteRecurringTransactionHandler } from './delete-recurring-transaction.handler';

const WORKSPACE_ID = 'workspace-uuid-abc';
const USER_ID = 'user-uuid-abc';
const RECURRING_ID = 'recurring-uuid-123';

const tokenPayload: TokenPayloadSchema = {
  sub: USER_ID,
  workspaceId: WORKSPACE_ID,
} as TokenPayloadSchema;

const makeRequest = (recurringTransactionId = RECURRING_ID) =>
  recurringTransactionId;

describe('DeleteRecurringTransactionController', () => {
  let controller: DeleteRecurringTransactionController;
  let handler: jest.Mocked<DeleteRecurringTransactionHandler>;

  beforeEach(async () => {
    const mockHandler = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<DeleteRecurringTransactionHandler>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeleteRecurringTransactionController],
      providers: [
        { provide: DeleteRecurringTransactionHandler, useValue: mockHandler },
      ],
    }).compile();

    controller = module.get<DeleteRecurringTransactionController>(
      DeleteRecurringTransactionController,
    );
    handler = module.get<DeleteRecurringTransactionHandler>(
      DeleteRecurringTransactionHandler,
    ) as jest.Mocked<DeleteRecurringTransactionHandler>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle – Success', () => {
    it('should call handler.execute with recurringTransactionId and workspaceId from token', async () => {
      handler.execute.mockResolvedValue(right({} as never));

      await controller.handle(makeRequest(), tokenPayload);

      expect(handler.execute).toHaveBeenCalledTimes(1);
      expect(handler.execute).toHaveBeenCalledWith({
        recurringTransactionId: RECURRING_ID,
        workspaceId: WORKSPACE_ID,
      });
    });

    it('should return undefined on success (204 No Content)', async () => {
      handler.execute.mockResolvedValue(right({} as never));

      const result = await controller.handle(makeRequest(), tokenPayload);

      expect(result).toBeUndefined();
    });
  });

  describe('handle – Error', () => {
    it.each([
      [HttpStatus.NOT_FOUND, 'Transaction not found'],
      [HttpStatus.FORBIDDEN, 'Unauthorized'],
      [HttpStatus.UNAUTHORIZED, 'Unauthorized'],
    ])(
      'should throw when handler returns Left(%i)',
      async (status, message) => {
        handler.execute.mockResolvedValue(
          left(new HttpException(message, status)),
        );

        await expect(
          controller.handle(makeRequest(), tokenPayload),
        ).rejects.toThrow(HttpException);

        await expect(
          controller.handle(makeRequest(), tokenPayload),
        ).rejects.toMatchObject({ status, message });
      },
    );

    it('should call handler.execute exactly once per request on error path', async () => {
      handler.execute.mockResolvedValue(
        left(new HttpException('Transaction not found', HttpStatus.NOT_FOUND)),
      );

      await expect(
        controller.handle(makeRequest(), tokenPayload),
      ).rejects.toThrow();

      expect(handler.execute).toHaveBeenCalledTimes(1);
    });
  });
});
