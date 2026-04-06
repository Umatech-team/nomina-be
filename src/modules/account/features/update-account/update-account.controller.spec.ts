import { AccountType } from '@constants/enums';
import { createMockAccount } from '@modules/account/test-helpers/mock-factories';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from '@providers/auth/guards/Roles.guard';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { left, right } from '@shared/core/errors/Either';
import { UpdateAccountController } from './update-account.controller';
import { UpdateAccountRequest } from './update-account.dto';
import { UpdateAccountHandler } from './update-account.handler';
import { describe, beforeEach, afterEach, it } from 'node:test';

const WORKSPACE_ID = 'workspace-id-abc';
const ACCOUNT_ID = '123e4567-e89b-12d3-a456-426614174000';

const tokenPayload = {
  workspaceId: WORKSPACE_ID,
  sub: 'user-id',
} as TokenPayloadSchema;

const makeBody = (
  overrides: Partial<UpdateAccountRequest> = {},
): UpdateAccountRequest => ({
  name: 'Updated Name',
  type: AccountType.CHECKING,
  closingDay: null,
  dueDay: null,
  ...overrides,
});

describe('UpdateAccountController', () => {
  let controller: UpdateAccountController;
  let handler: jest.Mocked<UpdateAccountHandler>;

  beforeEach(async () => {
    const mockHandler = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UpdateAccountHandler>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdateAccountController],
      providers: [{ provide: UpdateAccountHandler, useValue: mockHandler }],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UpdateAccountController>(UpdateAccountController);
    handler = module.get<UpdateAccountHandler>(
      UpdateAccountHandler,
    ) as jest.Mocked<UpdateAccountHandler>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle – Success Cases', () => {
    it('should call handler.execute with body, accountId and workspaceId from token', async () => {
      const body = makeBody();
      const mockAccount = createMockAccount({
        id: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
      });
      handler.execute.mockResolvedValue(right(mockAccount));

      await controller.handle(tokenPayload, ACCOUNT_ID, body);

      expect(handler.execute).toHaveBeenCalledWith({
        ...body,
        accountId: ACCOUNT_ID,
        workspaceId: WORKSPACE_ID,
      });
    });

    it('should return data wrapped in AccountPresenter format', async () => {
      const mockAccount = createMockAccount({
        id: ACCOUNT_ID,
        name: 'Updated Name',
        type: AccountType.CHECKING,
      });
      handler.execute.mockResolvedValue(right(mockAccount));

      const result = await controller.handle(
        tokenPayload,
        ACCOUNT_ID,
        makeBody(),
      );

      expect(result).toHaveProperty('data');
      expect(result.data).toMatchObject({
        id: ACCOUNT_ID,
        name: 'Updated Name',
      });
    });
  });

  describe('handle – Error Cases', () => {
    it('should throw when handler returns Left(404)', async () => {
      handler.execute.mockResolvedValue(
        left(new HttpException('Account not found', HttpStatus.NOT_FOUND)),
      );

      await expect(
        controller.handle(tokenPayload, ACCOUNT_ID, makeBody()),
      ).rejects.toThrow();
    });

    it('should throw when handler returns Left(403)', async () => {
      handler.execute.mockResolvedValue(
        left(new HttpException('Forbidden', HttpStatus.FORBIDDEN)),
      );

      await expect(
        controller.handle(tokenPayload, ACCOUNT_ID, makeBody()),
      ).rejects.toThrow();
    });

    it('should throw when handler returns Left(409)', async () => {
      handler.execute.mockResolvedValue(
        left(
          new HttpException(
            'An account with this name already exists',
            HttpStatus.CONFLICT,
          ),
        ),
      );

      await expect(
        controller.handle(tokenPayload, ACCOUNT_ID, makeBody()),
      ).rejects.toThrow();
    });
  });
});
