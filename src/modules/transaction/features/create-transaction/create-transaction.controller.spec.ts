import { TransactionStatus, TransactionType } from '@constants/enums';
import { Transaction } from '@modules/transaction/entities/Transaction';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { left, right } from '@shared/core/errors/Either';
import { CreateTransactionController } from './create-transaction.controller';
import { CreateTransactionRequest } from './create-transaction.dto';
import { CreateTransactionHandler } from './create-transaction.handle';

const WORKSPACE_ID = 'workspace-uuid-abc';
const USER_ID = 'user-uuid-abc';

const tokenPayload: TokenPayloadSchema = {
  sub: USER_ID,
  workspaceId: WORKSPACE_ID,
} as TokenPayloadSchema;

const makeBody = (
  overrides: Partial<CreateTransactionRequest> = {},
): CreateTransactionRequest => ({
  accountId: 'account-uuid-123',
  categoryId: 'category-uuid-123',
  title: 'Groceries',
  description: null,
  amount: 15000,
  date: new Date('2026-03-01'),
  type: TransactionType.EXPENSE,
  status: TransactionStatus.COMPLETED,
  ...overrides,
});

const makeTransaction = (
  overrides: Partial<ConstructorParameters<typeof Transaction>[0]> = {},
): Transaction =>
  new Transaction(
    {
      workspaceId: WORKSPACE_ID,
      accountId: 'account-uuid-123',
      destinationAccountId: null,
      categoryId: 'category-uuid-123',
      title: 'Groceries',
      description: null,
      amount: 15000n,
      date: new Date('2026-03-01'),
      type: TransactionType.EXPENSE,
      status: TransactionStatus.COMPLETED,
      recurringId: null,
      createdAt: new Date('2026-03-01'),
      updatedAt: null,
      ...overrides,
    },
    'transaction-uuid-123',
  );

describe('CreateTransactionController', () => {
  let controller: CreateTransactionController;
  let handler: jest.Mocked<CreateTransactionHandler>;

  beforeEach(async () => {
    const mockHandler = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateTransactionHandler>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateTransactionController],
      providers: [{ provide: CreateTransactionHandler, useValue: mockHandler }],
    }).compile();

    controller = module.get<CreateTransactionController>(
      CreateTransactionController,
    );
    handler = module.get<CreateTransactionHandler>(
      CreateTransactionHandler,
    ) as jest.Mocked<CreateTransactionHandler>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle – Success', () => {
    it('should call handler.execute with body merged with token payload', async () => {
      const body = makeBody();
      handler.execute.mockResolvedValue(right(makeTransaction()));

      await controller.handle(tokenPayload, body);

      expect(handler.execute).toHaveBeenCalledTimes(1);
      expect(handler.execute).toHaveBeenCalledWith({
        ...body,
        sub: USER_ID,
        workspaceId: WORKSPACE_ID,
      });
    });

    it('should return serialized transaction wrapped in data on success', async () => {
      const transaction = makeTransaction();
      handler.execute.mockResolvedValue(right(transaction));

      const result = await controller.handle(tokenPayload, makeBody());

      expect(result).toHaveProperty('data');
      expect(result.data).toMatchObject({
        id: transaction.id,
        workspaceId: transaction.workspaceId,
        accountId: transaction.accountId,
        categoryId: transaction.categoryId,
        description: transaction.description,
        type: transaction.type,
        status: transaction.status,
      });
    });

    it('should not expose Either internals on successful response', async () => {
      handler.execute.mockResolvedValue(right(makeTransaction()));

      const result = await controller.handle(tokenPayload, makeBody());

      expect(result).not.toHaveProperty('isLeft');
      expect(result).not.toHaveProperty('isRight');
    });

    it('should convert amount from cents to decimal in the response', async () => {
      const transaction = makeTransaction({ amount: 15000n });
      handler.execute.mockResolvedValue(right(transaction));

      const result = await controller.handle(tokenPayload, makeBody());

      expect(result.data.amount).toBe(150);
    });
  });

  describe('handle – Error', () => {
    it.each([
      [HttpStatus.UNAUTHORIZED, 'Unauthorized'],
      [HttpStatus.NOT_FOUND, 'Account not found'],
      [HttpStatus.BAD_REQUEST, 'Invalid request'],
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
