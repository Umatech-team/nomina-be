import { createMockAccount } from '@modules/account/test-helpers/mock-factories';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from '@providers/auth/guards/Roles.guard';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { right } from '@shared/core/errors/Either';
import { ListAccountsController } from './list-accounts.controller';
import { ListAccountsRequest } from './list-accounts.dto';
import { ListAccountsHandler } from './list-accounts.handler';

const WORKSPACE_ID = 'workspace-id-abc';

const tokenPayload = {
  workspaceId: WORKSPACE_ID,
  sub: 'user-id',
} as TokenPayloadSchema;

const makeQuery = (
  overrides: Partial<ListAccountsRequest> = {},
): ListAccountsRequest => ({
  page: 1,
  pageSize: 10,
  ...overrides,
});

describe('ListAccountsController', () => {
  let controller: ListAccountsController;
  let handler: jest.Mocked<ListAccountsHandler>;

  beforeEach(async () => {
    const mockHandler = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ListAccountsHandler>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListAccountsController],
      providers: [{ provide: ListAccountsHandler, useValue: mockHandler }],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ListAccountsController>(ListAccountsController);
    handler = module.get<ListAccountsHandler>(
      ListAccountsHandler,
    ) as jest.Mocked<ListAccountsHandler>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle – Success Cases', () => {
    it('should call handler.execute with query params merged with workspaceId from token', async () => {
      const query = makeQuery();
      handler.execute.mockResolvedValue(right({ accounts: [], total: 0 }));

      await controller.handle(tokenPayload, query);

      expect(handler.execute).toHaveBeenCalledWith({
        ...query,
        workspaceId: WORKSPACE_ID,
      });
    });

    it('should return accounts array and total in response', async () => {
      const accounts = [
        createMockAccount({ id: 'acc-1', workspaceId: WORKSPACE_ID }),
        createMockAccount({ id: 'acc-2', workspaceId: WORKSPACE_ID }),
      ];
      handler.execute.mockResolvedValue(right({ accounts, total: 2 }));

      const result = await controller.handle(tokenPayload, makeQuery());

      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('accounts');
      expect(result.data).toHaveProperty('total', 2);
      expect(result.data.accounts).toHaveLength(2);
    });

    it('should map each account through AccountPresenter.toHTTP', async () => {
      const account = createMockAccount({
        id: 'acc-1',
        workspaceId: WORKSPACE_ID,
        name: 'Savings',
        balance: 50000n, // 500.00
      });
      handler.execute.mockResolvedValue(
        right({ accounts: [account], total: 1 }),
      );

      const result = await controller.handle(tokenPayload, makeQuery());

      expect(result.data.accounts[0]).toMatchObject({
        id: 'acc-1',
        name: 'Savings',
        balance: 500, // cents to decimal
      });
    });

    it('should return empty accounts array when workspace has no accounts', async () => {
      handler.execute.mockResolvedValue(right({ accounts: [], total: 0 }));

      const result = await controller.handle(tokenPayload, makeQuery());

      expect(result.data.accounts).toEqual([]);
      expect(result.data.total).toBe(0);
    });

    it('should pass pagination params correctly (page=2, pageSize=25)', async () => {
      handler.execute.mockResolvedValue(right({ accounts: [], total: 0 }));

      await controller.handle(
        tokenPayload,
        makeQuery({ page: 2, pageSize: 25 }),
      );

      expect(handler.execute).toHaveBeenCalledWith({
        page: 2,
        pageSize: 25,
        workspaceId: WORKSPACE_ID,
      });
    });
  });
});
