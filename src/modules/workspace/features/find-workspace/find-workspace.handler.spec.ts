import { UserRole } from '@constants/enums';
import { Workspace } from '@modules/workspace/entities/Workspace';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { statusCode } from '@shared/core/types/statusCode';
import { FindWorkspaceRequest } from './find-workspace.dto';
import { FindWorkspaceByIdHandler } from './find-workspace.handler';

const WORKSPACE_ID = 'workspace-uuid-001';
const USER_ID = 'user-uuid-001';

function makeRequest(
  overrides?: Partial<FindWorkspaceRequest & { sub: string }>,
): FindWorkspaceRequest & { sub: string } {
  return {
    workspaceId: WORKSPACE_ID,
    sub: USER_ID,
    ...overrides,
  };
}

function makeWorkspace(id = WORKSPACE_ID): Workspace {
  return { id } as unknown as Workspace;
}

function makeWorkspaceUser(role = UserRole.OWNER): WorkspaceUser {
  return { role } as unknown as WorkspaceUser;
}

describe('FindWorkspaceByIdHandler', () => {
  let handler: FindWorkspaceByIdHandler;
  let workspaceRepository: jest.Mocked<WorkspaceRepository>;
  let workspaceUserRepository: jest.Mocked<WorkspaceUserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindWorkspaceByIdHandler,
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

    handler = module.get(FindWorkspaceByIdHandler);
    workspaceRepository = module.get(WorkspaceRepository);
    workspaceUserRepository = module.get(WorkspaceUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function arrangeSuccessMocks(role = UserRole.OWNER): void {
    workspaceRepository.findById.mockResolvedValue(makeWorkspace());
    workspaceUserRepository.findUserByWorkspaceAndUserId.mockResolvedValue(
      makeWorkspaceUser(role),
    );
  }

  describe('execute – Success Cases', () => {
    it.each([
      [UserRole.OWNER],
      [UserRole.ADMIN],
      [UserRole.USER],
      [UserRole.VIEWER],
    ])(
      'should return Right({ workspace, role }) when workspace exists and user is a member with role %s',
      async (role) => {
        arrangeSuccessMocks(role);
        const request = makeRequest();

        const result = await handler.execute(request);

        expect(result.isRight()).toBe(true);
        const value = result.value as { workspace: Workspace; role: UserRole };
        expect(value.workspace).toEqual(makeWorkspace());
        expect(value.role).toBe(role);
        expect(workspaceRepository.findById).toHaveBeenCalledTimes(1);
        expect(workspaceRepository.findById).toHaveBeenCalledWith(WORKSPACE_ID);
        expect(
          workspaceUserRepository.findUserByWorkspaceAndUserId,
        ).toHaveBeenCalledTimes(1);
        expect(
          workspaceUserRepository.findUserByWorkspaceAndUserId,
        ).toHaveBeenCalledWith(WORKSPACE_ID, USER_ID);
      },
    );
  });

  describe('execute – Failure Cases', () => {
    it('should return Left(NOT_FOUND) and skip membership check when workspace does not exist', async () => {
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
    });

    it('should return Left(UNAUTHORIZED) when user is not a member of the workspace', async () => {
      workspaceRepository.findById.mockResolvedValue(makeWorkspace());
      workspaceUserRepository.findUserByWorkspaceAndUserId.mockResolvedValue(
        null,
      );
      const request = makeRequest();

      const result = await handler.execute(request);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(HttpException);
      expect((result.value as HttpException).getStatus()).toBe(
        statusCode.UNAUTHORIZED,
      );
    });
  });
});
