import { AccountType } from '@constants/enums';
import { createMockAccount } from '@modules/account/test-helpers/mock-factories';
import { SubscriptionLimitsGuard } from '@modules/subscription/guards/SubscriptionLimits.guard';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from '@providers/auth/guards/Roles.guard';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { left, right } from '@shared/core/errors/Either';
import { CreateAccountController } from './create-account.controller';
import { CreateAccountRequest } from './create-account.dto';
import { CreateAccountHandler } from './create-account.handler';

const WORKSPACE_ID = 'workspace-id-abc';
const USER_ID = 'user-id-abc';

const tokenPayload = {
  workspaceId: WORKSPACE_ID,
  sub: USER_ID,
} as TokenPayloadSchema;

const makeBody = (
  overrides: Partial<CreateAccountRequest> = {},
): CreateAccountRequest => ({
  name: 'My Checking',
  type: AccountType.CHECKING,
  icon: null,
  color: null,
  closingDay: null,
  dueDay: null,
  ...overrides,
});

describe('CreateAccountController', () => {
  let controller: CreateAccountController;
  let handler: jest.Mocked<CreateAccountHandler>;

  beforeEach(async () => {
    const mockHandler = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateAccountHandler>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateAccountController],
      providers: [{ provide: CreateAccountHandler, useValue: mockHandler }],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(SubscriptionLimitsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CreateAccountController>(CreateAccountController);
    handler = module.get<CreateAccountHandler>(
      CreateAccountHandler,
    ) as jest.Mocked<CreateAccountHandler>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle – Success Cases', () => {
    it('should call handler.execute with body merged with token payload', async () => {
      const body = makeBody();
      const mockAccount = createMockAccount();
      handler.execute.mockResolvedValue(right(mockAccount));

      await controller.handle(tokenPayload, body);

      expect(handler.execute).toHaveBeenCalledWith({
        ...body,
        workspaceId: WORKSPACE_ID,
        sub: USER_ID,
      });
    });

    it('should return account data via AccountPresenter on success', async () => {
      const mockAccount = createMockAccount({ name: 'My Checking' });
      handler.execute.mockResolvedValue(right(mockAccount));

      const result = await controller.handle(tokenPayload, makeBody());

      expect(result).toHaveProperty('data');
      expect(result.data).toMatchObject({
        id: mockAccount.id,
        name: mockAccount.name,
        type: mockAccount.type,
      });
    });

    it('should not include isLeft/isRight on successful response', async () => {
      const mockAccount = createMockAccount();
      handler.execute.mockResolvedValue(right(mockAccount));

      const result = await controller.handle(tokenPayload, makeBody());

      expect(result).not.toHaveProperty('isLeft');
      expect(result).not.toHaveProperty('isRight');
    });

    it('should create CREDIT type account with closingDay and dueDay', async () => {
      const body = makeBody({
        type: AccountType.CREDIT_CARD,
        closingDay: 15,
        dueDay: 25,
      });
      const mockAccount = createMockAccount({
        type: AccountType.CREDIT_CARD,
        closingDay: 15,
        dueDay: 25,
      });
      handler.execute.mockResolvedValue(right(mockAccount));

      const result = await controller.handle(tokenPayload, body);

      expect(result.data).toMatchObject({
        type: AccountType.CREDIT_CARD,
        closingDay: 15,
        dueDay: 25,
      });
    });

    it('should create account with custom icon and color', async () => {
      const body = makeBody({ icon: 'bank', color: '#FF5733' });
      const mockAccount = createMockAccount({ icon: 'bank', color: '#FF5733' });
      handler.execute.mockResolvedValue(right(mockAccount));

      const result = await controller.handle(tokenPayload, body);

      expect(result.data).toMatchObject({
        icon: 'bank',
        color: '#FF5733',
      });
    });
  });

  describe('handle – Error Cases', () => {
    it('should throw when handler returns Left(404) (user not found)', async () => {
      handler.execute.mockResolvedValue(
        left(new HttpException('User not found', HttpStatus.NOT_FOUND)),
      );

      await expect(controller.handle(tokenPayload, makeBody())).rejects.toThrow(
        HttpException,
      );
      await expect(
        controller.handle(tokenPayload, makeBody()),
      ).rejects.toMatchObject({
        message: 'User not found',
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw when handler returns Left(409) (name conflict)', async () => {
      handler.execute.mockResolvedValue(
        left(
          new HttpException(
            "There's already an account with this name",
            HttpStatus.CONFLICT,
          ),
        ),
      );

      await expect(controller.handle(tokenPayload, makeBody())).rejects.toThrow(
        HttpException,
      );
      await expect(
        controller.handle(tokenPayload, makeBody()),
      ).rejects.toMatchObject({
        message: "There's already an account with this name",
        status: HttpStatus.CONFLICT,
      });
    });

    it('should throw when handler returns Left(400) (bad request)', async () => {
      handler.execute.mockResolvedValue(
        left(
          new HttpException('Workspace ID is required', HttpStatus.BAD_REQUEST),
        ),
      );

      await expect(controller.handle(tokenPayload, makeBody())).rejects.toThrow(
        HttpException,
      );
      await expect(
        controller.handle(tokenPayload, makeBody()),
      ).rejects.toMatchObject({
        message: 'Workspace ID is required',
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw when handler returns Left(403) (forbidden)', async () => {
      handler.execute.mockResolvedValue(
        left(new HttpException('Forbidden resource', HttpStatus.FORBIDDEN)),
      );

      await expect(controller.handle(tokenPayload, makeBody())).rejects.toThrow(
        HttpException,
      );
    });
  });
});
