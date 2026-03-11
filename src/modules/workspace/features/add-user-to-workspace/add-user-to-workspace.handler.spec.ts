import { UserRole } from '@constants/enums';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import {
  createMockUser,
  createMockUserRepository,
  createMockWorkspaceUserRepository,
} from '@modules/user/test-helpers/mock-factories';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { statusCode } from '@shared/core/types/statusCode';
import { AddUserToWorkspaceHandler } from './add-user-to-workspace.handler';

type Request = {
  workspaceId: string;
  userId: string;
  role: UserRole;
  sub: string;
};

function makeRequest(overrides?: Partial<Request>): Request {
  return {
    workspaceId: 'workspace-id-1',
    userId: 'target-user-id',
    role: UserRole.USER,
    sub: 'current-user-sub',
    ...overrides,
  };
}

function makeWorkspaceUser(
  overrides?: Partial<{ workspaceId: string; userId: string; role: UserRole }>,
): WorkspaceUser {
  const result = WorkspaceUser.create({
    workspaceId: overrides?.workspaceId ?? 'workspace-id-1',
    userId: overrides?.userId ?? 'current-user-sub',
    role: overrides?.role ?? UserRole.OWNER,
    isDefault: true,
  });
  if (result.isLeft())
    throw new Error(`makeWorkspaceUser: ${result.value.message}`);
  return result.value;
}

describe('AddUserToWorkspaceHandler', () => {
  let handler: AddUserToWorkspaceHandler;
  let workspaceUserRepository: jest.Mocked<WorkspaceUserRepository>;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    workspaceUserRepository = createMockWorkspaceUserRepository();
    userRepository = createMockUserRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddUserToWorkspaceHandler,
        { provide: WorkspaceUserRepository, useValue: workspaceUserRepository },
        { provide: UserRepository, useValue: userRepository },
      ],
    }).compile();

    handler = module.get(AddUserToWorkspaceHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function arrangeSuccessMocks(): void {
    workspaceUserRepository.findUserByWorkspaceAndUserId
      .mockResolvedValueOnce(makeWorkspaceUser())
      .mockResolvedValueOnce(null);
    userRepository.findUniqueById.mockResolvedValue(createMockUser());
    workspaceUserRepository.addUserToWorkspace.mockImplementation((wu) =>
      Promise.resolve(wu),
    );
  }

  describe('success', () => {
    it('should add target user to workspace and return right with the created WorkspaceUser', async () => {
      const request = makeRequest();
      arrangeSuccessMocks();

      const result = await handler.execute(request);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toBeInstanceOf(WorkspaceUser);
        expect(result.value.workspaceId).toBe(request.workspaceId);
        expect(result.value.userId).toBe(request.userId);
        expect(result.value.role).toBe(request.role);
        expect(result.value.isDefault).toBe(false);
      }
      expect(
        workspaceUserRepository.findUserByWorkspaceAndUserId,
      ).toHaveBeenNthCalledWith(1, request.workspaceId, request.sub);
      expect(userRepository.findUniqueById).toHaveBeenCalledWith(
        request.userId,
      );
      expect(
        workspaceUserRepository.findUserByWorkspaceAndUserId,
      ).toHaveBeenNthCalledWith(2, request.workspaceId, request.userId);
      expect(workspaceUserRepository.addUserToWorkspace).toHaveBeenCalledTimes(
        1,
      );
    });
  });

  describe('failure paths', () => {
    it.each([
      {
        scenario: 'current user is not a member of the workspace',
        arrange: () => {
          workspaceUserRepository.findUserByWorkspaceAndUserId.mockResolvedValue(
            null,
          );
          userRepository.findUniqueById.mockResolvedValue(createMockUser());
        },
        expectedStatus: statusCode.FORBIDDEN,
      },
      {
        scenario: 'target user does not exist',
        arrange: () => {
          workspaceUserRepository.findUserByWorkspaceAndUserId.mockResolvedValueOnce(
            makeWorkspaceUser(),
          );
          userRepository.findUniqueById.mockResolvedValue(null);
        },
        expectedStatus: statusCode.NOT_FOUND,
      },
      {
        scenario: 'target user is already a member of the workspace',
        arrange: () => {
          workspaceUserRepository.findUserByWorkspaceAndUserId
            .mockResolvedValueOnce(makeWorkspaceUser())
            .mockResolvedValueOnce(
              makeWorkspaceUser({
                userId: 'target-user-id',
                role: UserRole.USER,
              }),
            );
          userRepository.findUniqueById.mockResolvedValue(createMockUser());
        },
        expectedStatus: statusCode.CONFLICT,
      },
    ])(
      'should return left when $scenario',
      async ({ arrange, expectedStatus }) => {
        arrange();
        const request = makeRequest();

        const result = await handler.execute(request);

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(HttpException);
        expect((result.value as HttpException).getStatus()).toBe(
          expectedStatus,
        );
      },
    );
  });
});
