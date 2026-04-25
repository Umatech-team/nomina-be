import { UserRole } from '@constants/enums';
import { SubscriptionLimitsGuard } from '@modules/subscription/guards/SubscriptionLimits.guard';
import {
    WorkspaceInvite,
    type WorkspaceInviteProps,
} from '@modules/workspace/entities/WorkspaceInvite';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from '@providers/auth/guards/Roles.guard';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { left, right } from '@shared/core/errors/Either';
import { CreateWorkspaceInviteController } from './create-workspace-invite.controller';
import { type CreateWorkspaceInviteRequest } from './create-workspace-invite.dto';
import { CreateWorkspaceInviteService } from './create-workspace-invite.service';

const WORKSPACE_ID = 'workspace-id-abc';
const USER_ID = 'user-id-abc';

const tokenPayload: TokenPayloadSchema = {
  sub: USER_ID,
  workspaceId: WORKSPACE_ID,
} as TokenPayloadSchema;

const makeBody = (
  overrides: Partial<CreateWorkspaceInviteRequest> = {},
): CreateWorkspaceInviteRequest => ({
  role: UserRole.USER,
  ...overrides,
});

const makeMockInvite = (
  overrides: Partial<WorkspaceInviteProps> = {},
): WorkspaceInvite => {
  const result = WorkspaceInvite.create(
    {
      code: 'ABC12345',
      workspaceId: WORKSPACE_ID,
      role: UserRole.USER,
      createdBy: USER_ID,
      expiresAt: new Date('2026-03-13T00:00:00.000Z'),
      ...overrides,
    },
    'invite-id-abc',
  );
  if (result.isRight()) return result.value;
  throw new Error('Invalid mock WorkspaceInvite props');
};

describe('CreateWorkspaceInviteController', () => {
  let controller: CreateWorkspaceInviteController;
  let service: jest.Mocked<CreateWorkspaceInviteService>;

  beforeEach(async () => {
    const mockService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateWorkspaceInviteService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateWorkspaceInviteController],
      providers: [
        { provide: CreateWorkspaceInviteService, useValue: mockService },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(SubscriptionLimitsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CreateWorkspaceInviteController>(
      CreateWorkspaceInviteController,
    );
    service = module.get<CreateWorkspaceInviteService>(
      CreateWorkspaceInviteService,
    ) as jest.Mocked<CreateWorkspaceInviteService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle – Success Cases', () => {
    it('should call service.execute with role, sub, and workspaceId from token', async () => {
      const body = makeBody({ role: UserRole.ADMIN });
      const mockInvite = makeMockInvite({ role: UserRole.ADMIN });
      service.execute.mockResolvedValue(right(mockInvite));

      await controller.handle(tokenPayload, body);

      expect(service.execute).toHaveBeenCalledTimes(1);
      expect(service.execute).toHaveBeenCalledWith({
        role: UserRole.ADMIN,
        sub: USER_ID,
        workspaceId: WORKSPACE_ID,
      });
    });

    it('should return serialized invite data via WorkspaceInvitePresenter on success', async () => {
      const expiresAt = new Date('2026-03-13T00:00:00.000Z');
      const mockInvite = makeMockInvite({ code: 'XYZ98765', expiresAt });
      service.execute.mockResolvedValue(right(mockInvite));

      const result = await controller.handle(tokenPayload, makeBody());

      expect(result).toHaveProperty('data');
      expect(result.data).toMatchObject({
        createdBy: USER_ID,
        code: 'XYZ98765',
        expiresAt,
      });
    });
  });

  describe('handle – Error Cases', () => {
    it.each([
      ['user not found', HttpStatus.NOT_FOUND, 'User not found'],
      [
        'workspace user not found',
        HttpStatus.NOT_FOUND,
        'Workspace user not found',
      ],
      [
        'invalid role',
        HttpStatus.BAD_REQUEST,
        'A função do convite deve ser ADMIN ou USER',
      ],
    ])(
      'should throw when service returns Left – %s (%i)',
      async (_label, status, message) => {
        service.execute.mockResolvedValue(
          left(new HttpException(message, status)),
        );

        await expect(
          controller.handle(tokenPayload, makeBody()),
        ).rejects.toThrow(HttpException);
        await expect(
          controller.handle(tokenPayload, makeBody()),
        ).rejects.toMatchObject({ message, status });
      },
    );
  });
});
