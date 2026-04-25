import { UserRole } from '@constants/enums';
import { SubscriptionLimitsGuard } from '@modules/subscription/guards/SubscriptionLimits.guard';
import { Workspace } from '@modules/workspace/entities/Workspace';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { left, right } from '@shared/core/errors/Either';
import { CreateWorkspaceController } from './create-workspace.controller';
import { CreateWorkspaceRequest } from './create-workspace.dto';
import { CreateWorkspaceService } from './create-workspace.service';

const USER_ID = 'user-id-abc';

const tokenPayload = { sub: USER_ID } as TokenPayloadSchema;

const makeBody = (
  overrides: Partial<CreateWorkspaceRequest> = {},
): CreateWorkspaceRequest => ({
  name: 'My Workspace',
  currency: 'BRL',
  isDefault: false,
  ...overrides,
});

const makeMockWorkspace = (
  overrides: Partial<{ name: string; currency: string }> = {},
): Workspace =>
  new Workspace(
    {
      name: overrides.name ?? 'My Workspace',
      currency: overrides.currency ?? 'BRL',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    },
    'workspace-id-abc',
  );

const makeMockWorkspaceUser = (): WorkspaceUser => {
  const result = WorkspaceUser.create(
    {
      userId: USER_ID,
      workspaceId: 'workspace-id-abc',
      role: UserRole.OWNER,
      isDefault: false,
    },
    'workspace-user-id-abc',
  );
  if (result.isRight()) return result.value;
  throw new Error('Invalid mock WorkspaceUser props');
};

describe('CreateWorkspaceController', () => {
  let controller: CreateWorkspaceController;
  let service: jest.Mocked<CreateWorkspaceService>;

  beforeEach(async () => {
    const mockService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateWorkspaceService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateWorkspaceController],
      providers: [{ provide: CreateWorkspaceService, useValue: mockService }],
    })
      .overrideGuard(SubscriptionLimitsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CreateWorkspaceController>(
      CreateWorkspaceController,
    );
    service = module.get<CreateWorkspaceService>(
      CreateWorkspaceService,
    ) as jest.Mocked<CreateWorkspaceService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle Success Cases', () => {
    it('should call service.execute with body merged with sub from token', async () => {
      const body = makeBody();
      const workspace = makeMockWorkspace();
      const workspaceUser = makeMockWorkspaceUser();
      service.execute.mockResolvedValue(right({ workspace, workspaceUser }));

      await controller.handle(tokenPayload, body);

      expect(service.execute).toHaveBeenCalledWith({
        ...body,
        sub: USER_ID,
      });
    });

    it('should return workspace data via WorkspacePresenter on success', async () => {
      const workspace = makeMockWorkspace({ name: 'Personal Finance' });
      const workspaceUser = makeMockWorkspaceUser();
      service.execute.mockResolvedValue(right({ workspace, workspaceUser }));

      const result = await controller.handle(
        tokenPayload,
        makeBody({ name: 'Personal Finance' }),
      );

      expect(result).toEqual({
        data: {
          id: workspace.id,
          name: workspace.name,
          currency: workspace.currency,
          createdAt: workspace.createdAt,
        },
      });
    });

    it('should not leak Either internals on successful response', async () => {
      const workspace = makeMockWorkspace();
      const workspaceUser = makeMockWorkspaceUser();
      service.execute.mockResolvedValue(right({ workspace, workspaceUser }));

      const result = await controller.handle(tokenPayload, makeBody());

      expect(result).not.toHaveProperty('isLeft');
      expect(result).not.toHaveProperty('isRight');
    });
  });

  describe('handle Failure Cases', () => {
    it.each([
      [HttpStatus.BAD_REQUEST, 'Invalid workspace data'],
      [HttpStatus.CONFLICT, 'Workspace already exists'],
      [HttpStatus.INTERNAL_SERVER_ERROR, 'Unexpected error'],
    ])(
      'should throw when service returns left with status %s',
      async (status, message) => {
        service.execute.mockResolvedValue(
          left(new HttpException(message, status)),
        );

        await expect(
          controller.handle(tokenPayload, makeBody()),
        ).rejects.toThrow();
        expect(service.execute).toHaveBeenCalledTimes(1);
      },
    );

    it('should call service.execute exactly once even on failure', async () => {
      service.execute.mockResolvedValue(
        left(new HttpException('Error', HttpStatus.BAD_REQUEST)),
      );

      await expect(
        controller.handle(tokenPayload, makeBody()),
      ).rejects.toThrow();

      expect(service.execute).toHaveBeenCalledTimes(1);
    });
  });
});
