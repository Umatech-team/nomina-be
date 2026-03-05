import { createMockAccount } from '@modules/account/test-helpers/mock-factories';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { left, right } from '@shared/core/errors/Either';
import { FindAccountController } from './find-account.controller';
import { FindAccountRequest } from './find-account.dto';
import { FindAccountByIdHandler } from './find-account.handler';

const WORKSPACE_ID = 'workspace-id-abc';
const ACCOUNT_ID = '123e4567-e89b-12d3-a456-426614174000';

const tokenPayload = {
  workspaceId: WORKSPACE_ID,
  sub: 'user-id',
} as TokenPayloadSchema;
const params: FindAccountRequest = { accountId: ACCOUNT_ID };

describe('FindAccountController', () => {
  let controller: FindAccountController;
  let handler: jest.Mocked<FindAccountByIdHandler>;

  beforeEach(async () => {
    const mockHandler = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<FindAccountByIdHandler>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FindAccountController],
      providers: [{ provide: FindAccountByIdHandler, useValue: mockHandler }],
    }).compile();

    controller = module.get<FindAccountController>(FindAccountController);
    handler = module.get<FindAccountByIdHandler>(
      FindAccountByIdHandler,
    ) as jest.Mocked<FindAccountByIdHandler>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle – Success Cases', () => {
    it('should call handler.execute with accountId and workspaceId from token', async () => {
      const mockAccount = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
      });
      handler.execute.mockResolvedValue(right(mockAccount));

      await controller.handle(tokenPayload, params);

      expect(handler.execute).toHaveBeenCalledWith({
        accountId: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
      });
    });

    it('should return account data wrapped in AccountPresenter format', async () => {
      const mockAccount = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
        name: 'My Account',
        balance: 1000n,
      });
      handler.execute.mockResolvedValue(right(mockAccount));

      const result = await controller.handle(tokenPayload, params);

      expect(result).toHaveProperty('data');
      expect(result.data).toMatchObject({
        id: ACCOUNT_ID,
        name: 'My Account',
      });
    });

    it('should present balance as decimal via AccountPresenter', async () => {
      const mockAccount = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
        balance: 150000n, // 1500.00 in cents
      });
      handler.execute.mockResolvedValue(right(mockAccount));

      const result = await controller.handle(tokenPayload, params);

      // AccountPresenter converts cents to decimal
      expect(result.data.balance).toBe(1500);
    });
  });

  describe('handle – Error Cases', () => {
    it('should throw when handler returns Left(404)', async () => {
      handler.execute.mockResolvedValue(
        left(new HttpException('account not found', HttpStatus.NOT_FOUND)),
      );

      await expect(controller.handle(tokenPayload, params)).rejects.toThrow();
    });
  });
});
