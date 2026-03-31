import { RecurrenceFrequency, TransactionType } from '@constants/enums';
import { RecurringTransaction } from '@modules/transaction/entities/RecurringTransaction';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { left, right } from '@shared/core/errors/Either';
import { CreateRecurringTransactionController } from './create-recurring-transaction.controller';
import { CreateRecurringTransactionRequest } from './create-recurring-transaction.dto';
import { CreateRecurringTransactionHandler } from './create-recurring-transaction.handle';

const WORKSPACE_ID = 'workspace-id-abc';
const USER_ID = 'user-id-abc';

const tokenPayload: TokenPayloadSchema = {
  sub: USER_ID,
  workspaceId: WORKSPACE_ID,
} as TokenPayloadSchema;

const makeBody = (
  overrides: Partial<CreateRecurringTransactionRequest> = {},
): CreateRecurringTransactionRequest => ({
  accountId: 'account-id-123',
  categoryId: 'category-id-123',
  title: 'Salary',
  description: null,
  amount: 500000n,
  frequency: RecurrenceFrequency.MONTHLY,
  type: TransactionType.INCOME,
  interval: 1,
  startDate: new Date('2030-01-01'),
  endDate: null,
  active: true,
  ...overrides,
});

const createMockRecurringTransaction = (
  overrides: Partial<
    ConstructorParameters<typeof RecurringTransaction>[0]
  > = {},
): RecurringTransaction =>
  new RecurringTransaction(
    {
      workspaceId: WORKSPACE_ID,
      accountId: 'account-id-123',
      categoryId: 'category-id-123',
      title: 'Salary',
      description: null,
      amount: 500000n,
      frequency: RecurrenceFrequency.MONTHLY,
      interval: 1,
      startDate: new Date('2030-01-01'),
      endDate: null,
      lastGenerated: null,
      active: true,
      type: TransactionType.INCOME,
      ...overrides,
    },
    'recurring-id-123',
  );

describe('CreateRecurringTransactionController', () => {
  let controller: CreateRecurringTransactionController;
  let handler: jest.Mocked<CreateRecurringTransactionHandler>;

  beforeEach(async () => {
    const mockHandler = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateRecurringTransactionHandler>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateRecurringTransactionController],
      providers: [
        { provide: CreateRecurringTransactionHandler, useValue: mockHandler },
      ],
    }).compile();

    controller = module.get<CreateRecurringTransactionController>(
      CreateRecurringTransactionController,
    );
    handler = module.get<CreateRecurringTransactionHandler>(
      CreateRecurringTransactionHandler,
    ) as jest.Mocked<CreateRecurringTransactionHandler>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle – Success Cases', () => {
    it('should call handler.execute with body merged with token payload', async () => {
      const body = makeBody();
      handler.execute.mockResolvedValue(
        right(createMockRecurringTransaction()),
      );

      await controller.handle(tokenPayload, body);

      expect(handler.execute).toHaveBeenCalledWith({
        ...body,
        sub: USER_ID,
        workspaceId: WORKSPACE_ID,
      });
    });

    it('should return wrapped data via RecurringTransactionPresenter on success', async () => {
      const mockTransaction = createMockRecurringTransaction();
      handler.execute.mockResolvedValue(right(mockTransaction));

      const result = await controller.handle(tokenPayload, makeBody());

      expect(result).toHaveProperty('data');
      expect(result.data).toMatchObject({
        id: mockTransaction.id,
        workspaceId: mockTransaction.workspaceId,
        accountId: mockTransaction.accountId,
        description: mockTransaction.description,
        frequency: mockTransaction.frequency,
        interval: mockTransaction.interval,
        active: mockTransaction.active,
      });
    });

    it('should not expose Either internals on success', async () => {
      handler.execute.mockResolvedValue(
        right(createMockRecurringTransaction()),
      );

      const result = await controller.handle(tokenPayload, makeBody());

      expect(result).not.toHaveProperty('isLeft');
      expect(result).not.toHaveProperty('isRight');
    });
  });

  describe('handle – Error Cases', () => {
    it.each([
      [HttpStatus.UNAUTHORIZED, 'Unauthorized'],
      [
        HttpStatus.BAD_REQUEST,
        'Transaction cannot start today or in the past.',
      ],
    ])(
      'should throw when handler returns Left(%i)',
      async (status, message) => {
        handler.execute.mockResolvedValue(
          left(new HttpException(message, status)),
        );

        await expect(
          controller.handle(tokenPayload, makeBody()),
        ).rejects.toThrow(HttpException);

        await expect(
          controller.handle(tokenPayload, makeBody()),
        ).rejects.toMatchObject({ status, message });
      },
    );

    it('should call handler.execute exactly once per request on error path', async () => {
      handler.execute.mockResolvedValue(
        left(new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)),
      );

      await expect(
        controller.handle(tokenPayload, makeBody()),
      ).rejects.toThrow();

      expect(handler.execute).toHaveBeenCalledTimes(1);
    });
  });
});
