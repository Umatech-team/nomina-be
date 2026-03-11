import { UserRole } from '@constants/enums';
import { Workspace } from '@modules/workspace/entities/Workspace';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { statusCode } from '@shared/core/types/statusCode';
import { ListWorkspaceUsersRequest } from './list-user-from-workspace.dto';
import { ListUsersFromWorkspaceHandler } from './list-user-from-workspace.handler';

const WORKSPACE_ID = 'workspace-uuid-001';
const USER_ID = 'user-uuid-001';

function makeRequest(
  overrides?: Partial<ListWorkspaceUsersRequest & { sub: string }>,
): ListWorkspaceUsersRequest & { sub: string } {
  return {
    workspaceId: WORKSPACE_ID,
    page: 1,
    pageSize: 10,
    sub: USER_ID,
    ...overrides,
  };
}

function makeWorkspace(): Workspace {
  return { id: WORKSPACE_ID } as unknown as Workspace;
}

function makeWorkspaceUser(
  overrides: Partial<WorkspaceUser> = {},
): WorkspaceUser {
  return {
    id: 'wu-uuid-001',
    userId: USER_ID,
    workspaceId: WORKSPACE_ID,
    role: UserRole.OWNER,
    ...overrides,
  } as unknown as WorkspaceUser;
}

describe('ListUsersFromWorkspaceHandler', () => {
  let handler: ListUsersFromWorkspaceHandler;
  let workspaceRepository: jest.Mocked<WorkspaceRepository>;
  let workspaceUserRepository: jest.Mocked<WorkspaceUserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListUsersFromWorkspaceHandler,
        {
          provide: WorkspaceRepository,
          useValue: {
            create: jest.fn(),
            createWithOwnerAndAccount: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findById: jest.fn(),
            findManyByUserId: jest.fn(),
          },
        },
        {
          provide: WorkspaceUserRepository,
          useValue: {
            findDefaultWorkspaceByUserId: jest.fn(),
            addUserToWorkspace: jest.fn(),
            removeUserFromWorkspace: jest.fn(),
            updateUser: jest.fn(),
            findMembershipById: jest.fn(),
            findUsersByWorkspaceId: jest.fn(),
            findUserByWorkspaceAndUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(ListUsersFromWorkspaceHandler);
    workspaceRepository = module.get(WorkspaceRepository);
    workspaceUserRepository = module.get(WorkspaceUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function arrangeSuccessMocks(
    workspaceUsers: WorkspaceUser[] = [makeWorkspaceUser()],
    total = 1,
  ): void {
    workspaceRepository.findById.mockResolvedValue(makeWorkspace());
    workspaceUserRepository.findUserByWorkspaceAndUserId.mockResolvedValue(
      makeWorkspaceUser(),
    );
    workspaceUserRepository.findUsersByWorkspaceId.mockResolvedValue({
      workspaceUsers,
      total,
    });
  }

  describe('execute – Success Cases', () => {
    it('should return Right({ workspaceUsers, total }) with correct data and call all repositories with correct parameters', async () => {
      const members = [
        makeWorkspaceUser(),
        makeWorkspaceUser({ id: 'wu-uuid-002' } as Partial<WorkspaceUser>),
      ];
      arrangeSuccessMocks(members, 2);
      const request = makeRequest({ page: 2, pageSize: 20 });

      const result = await handler.execute(request);

      expect(result.isRight()).toBe(true);
      const value = result.value as {
        workspaceUsers: WorkspaceUser[];
        total: number;
      };
      expect(value.workspaceUsers).toEqual(members);
      expect(value.total).toBe(2);

      expect(workspaceRepository.findById).toHaveBeenCalledTimes(1);
      expect(workspaceRepository.findById).toHaveBeenCalledWith(WORKSPACE_ID);

      expect(
        workspaceUserRepository.findUserByWorkspaceAndUserId,
      ).toHaveBeenCalledTimes(1);
      expect(
        workspaceUserRepository.findUserByWorkspaceAndUserId,
      ).toHaveBeenCalledWith(WORKSPACE_ID, USER_ID);

      expect(
        workspaceUserRepository.findUsersByWorkspaceId,
      ).toHaveBeenCalledTimes(1);
      expect(
        workspaceUserRepository.findUsersByWorkspaceId,
      ).toHaveBeenCalledWith(WORKSPACE_ID, 2, 20);
    });

    it('should return Right with empty list when workspace has no members besides the requester', async () => {
      arrangeSuccessMocks([], 0);
      const request = makeRequest();

      const result = await handler.execute(request);

      expect(result.isRight()).toBe(true);
      const value = result.value as {
        workspaceUsers: WorkspaceUser[];
        total: number;
      };
      expect(value.workspaceUsers).toEqual([]);
      expect(value.total).toBe(0);
    });
  });

  describe('execute – Failure Cases', () => {
    it('should return Left(NOT_FOUND) and skip all subsequent calls when workspace does not exist', async () => {
      workspaceRepository.findById.mockResolvedValue(null);
      const request = makeRequest();

      const result = await handler.execute(request);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(HttpException);
      expect((result.value as HttpException).getStatus()).toBe(
        statusCode.NOT_FOUND,
      );

      expect(
        workspaceUserRepository.findUserByWorkspaceAndUserId,
      ).not.toHaveBeenCalled();
      expect(
        workspaceUserRepository.findUsersByWorkspaceId,
      ).not.toHaveBeenCalled();
    });

    it('should return Left(FORBIDDEN) and skip listing when user is not a member of the workspace', async () => {
      workspaceRepository.findById.mockResolvedValue(makeWorkspace());
      workspaceUserRepository.findUserByWorkspaceAndUserId.mockResolvedValue(
        null,
      );
      const request = makeRequest();

      const result = await handler.execute(request);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(HttpException);
      expect((result.value as HttpException).getStatus()).toBe(
        statusCode.FORBIDDEN,
      );

      expect(
        workspaceUserRepository.findUsersByWorkspaceId,
      ).not.toHaveBeenCalled();
    });
  });
});
