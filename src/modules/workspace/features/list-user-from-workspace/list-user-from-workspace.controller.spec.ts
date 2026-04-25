import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import {
    WorkspaceUser,
    WorkspaceUserProps,
} from '@modules/workspace/entities/WorkspaceUser';
import { WorkspaceUserPresenter } from '@modules/workspace/presenters/WorkspaceUser.presenter';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { ListUsersFromWorkspaceController } from './list-user-from-workspace.controller';
import { ListUsersFromWorkspaceService } from './list-user-from-workspace.service';

function makeQuery(overrides?: Partial<{ page: number; pageSize: number }>): {
  page: number;
  pageSize: number;
} {
  return {
    page: 1,
    pageSize: 10,
    ...overrides,
  };
}

function makeTokenPayload(
  overrides?: Partial<TokenPayloadSchema>,
): TokenPayloadSchema {
  return {
    sub: 'user-123',
    workspaceId: 'workspace-abc',
    role: UserRole.USER,
    ...overrides,
  };
}

function makeWorkspaceUser(
  overrides?: Partial<WorkspaceUserProps>,
  id?: string,
): WorkspaceUser {
  const result = WorkspaceUser.create(
    {
      workspaceId: 'workspace-abc',
      userId: 'user-123',
      role: UserRole.USER,
      isDefault: false,
      joinedAt: new Date('2026-01-01'),
      ...overrides,
    },
    id,
  );

  if (result.isLeft()) {
    throw new Error(`makeWorkspaceUser: ${result.value.message}`);
  }

  return result.value;
}

describe('ListUsersFromWorkspaceController', () => {
  let controller: ListUsersFromWorkspaceController;
  let service: jest.Mocked<ListUsersFromWorkspaceService>;

  beforeEach(async () => {
    const mockService = { execute: jest.fn() };

    jest.spyOn(ErrorPresenter, 'toHTTP').mockReturnValue(undefined as never);
    jest.spyOn(WorkspaceUserPresenter, 'toHTTP').mockReturnValue({
      id: 'wu-id',
      workspaceId: 'workspace-abc',
      userId: 'user-123',
      role: UserRole.USER,
      joinedAt: new Date('2026-01-01'),
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListUsersFromWorkspaceController],
      providers: [
        { provide: ListUsersFromWorkspaceService, useValue: mockService },
      ],
    }).compile();

    controller = module.get(ListUsersFromWorkspaceController);
    service = module.get(ListUsersFromWorkspaceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('should return workspace users and total when service succeeds', async () => {
      const query = makeQuery();
      const token = makeTokenPayload();
      const workspaceId = 'workspace-abc';
      const wu1 = makeWorkspaceUser({}, 'wu-1');
      const wu2 = makeWorkspaceUser({ userId: 'user-456' }, 'wu-2');

      service.execute.mockResolvedValue(
        right({ workspaceUsers: [wu1, wu2], total: 2 }),
      );

      const result = await controller.handle(token, workspaceId, query);

      expect(service.execute).toHaveBeenCalledTimes(1);
      expect(service.execute).toHaveBeenCalledWith({
        ...query,
        workspaceId,
        sub: token.sub,
      });
      expect(WorkspaceUserPresenter.toHTTP).toHaveBeenCalledTimes(2);
      expect(WorkspaceUserPresenter.toHTTP).toHaveBeenNthCalledWith(
        1,
        wu1,
        0,
        expect.any(Array),
      );
      expect(WorkspaceUserPresenter.toHTTP).toHaveBeenNthCalledWith(
        2,
        wu2,
        1,
        expect.any(Array),
      );
      expect(result).toEqual({
        workspaceUsers: [
          {
            id: 'wu-id',
            workspaceId: 'workspace-abc',
            userId: 'user-123',
            role: UserRole.USER,
            joinedAt: new Date('2026-01-01'),
          },
          {
            id: 'wu-id',
            workspaceId: 'workspace-abc',
            userId: 'user-123',
            role: UserRole.USER,
            joinedAt: new Date('2026-01-01'),
          },
        ],
        total: 2,
      });
    });

    it('should return empty list when workspace has no users', async () => {
      const query = makeQuery();
      const token = makeTokenPayload();
      const workspaceId = 'workspace-abc';

      service.execute.mockResolvedValue(
        right({ workspaceUsers: [], total: 0 }),
      );

      const result = await controller.handle(token, workspaceId, query);

      expect(WorkspaceUserPresenter.toHTTP).not.toHaveBeenCalled();
      expect(result).toEqual({ workspaceUsers: [], total: 0 });
    });
  });

  describe('Error Paths - Service returns Left', () => {
    it.each<{ scenario: string; message: string; status: number }>([
      {
        scenario: 'workspace not found',
        message: 'Workspace not found',
        status: statusCode.NOT_FOUND,
      },
      {
        scenario: 'user is not a member of the workspace',
        message: 'User is not a member of the workspace',
        status: statusCode.FORBIDDEN,
      },
    ])(
      'should delegate to ErrorPresenter when $scenario',
      async ({ message, status }) => {
        const query = makeQuery();
        const token = makeTokenPayload();
        const workspaceId = 'workspace-abc';
        const error = new HttpException(message, status);

        service.execute.mockResolvedValue(left(error));

        const result = await controller.handle(token, workspaceId, query);

        expect(ErrorPresenter.toHTTP).toHaveBeenCalledTimes(1);
        expect(ErrorPresenter.toHTTP).toHaveBeenCalledWith(error);
        expect(WorkspaceUserPresenter.toHTTP).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
      },
    );
  });
});
