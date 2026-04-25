import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { left, right } from '@shared/core/errors/Either';
import { DeleteRecurringTransactionController } from './delete-recurring-transaction.controller';
import { DeleteRecurringTransactionService } from './delete-recurring-transaction.service';

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
  let service: jest.Mocked<DeleteRecurringTransactionService>;

  beforeEach(async () => {
    const mockService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<DeleteRecurringTransactionService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeleteRecurringTransactionController],
      providers: [
        { provide: DeleteRecurringTransactionService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<DeleteRecurringTransactionController>(
      DeleteRecurringTransactionController,
    );
    service = module.get<DeleteRecurringTransactionService>(
      DeleteRecurringTransactionService,
    ) as jest.Mocked<DeleteRecurringTransactionService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle – Success', () => {
    it('should call service.execute with recurringTransactionId and workspaceId from token', async () => {
      service.execute.mockResolvedValue(right({} as never));

      await controller.handle(makeRequest(), tokenPayload);

      expect(service.execute).toHaveBeenCalledTimes(1);
      expect(service.execute).toHaveBeenCalledWith({
        recurringTransactionId: RECURRING_ID,
        workspaceId: WORKSPACE_ID,
      });
    });

    it('should return undefined on success (204 No Content)', async () => {
      service.execute.mockResolvedValue(right({} as never));

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
      'should throw when service returns Left(%i)',
      async (status, message) => {
        service.execute.mockResolvedValue(
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

    it('should call service.execute exactly once per request on error path', async () => {
      service.execute.mockResolvedValue(
        left(new HttpException('Transaction not found', HttpStatus.NOT_FOUND)),
      );

      await expect(
        controller.handle(makeRequest(), tokenPayload),
      ).rejects.toThrow();

      expect(service.execute).toHaveBeenCalledTimes(1);
    });
  });
});
