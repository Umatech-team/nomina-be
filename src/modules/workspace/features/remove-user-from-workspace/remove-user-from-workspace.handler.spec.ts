import { UserRole } from '@constants/enums';
import { createMockWorkspaceUserRepository } from '@modules/user/test-helpers/mock-factories';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RemoveUserFromWorkspaceHandler } from './remove-user-from-workspace.handler';

type Request = {
  userId: string;
  workspaceId: string;
};

function makeRequest(overrides?: Partial<Request>): Request {
  return {
    userId: 'user-id-1',
    workspaceId: 'workspace-id-1',
    ...overrides,
  };
}

function makeWorkspaceUser(): WorkspaceUser {
  const result = WorkspaceUser.create({
    workspaceId: 'workspace-id-1',
    userId: 'user-id-1',
    role: UserRole.USER,
    isDefault: false,
  });
  if (result.isLeft())
    throw new Error(`makeWorkspaceUser: ${result.value.message}`);
  return result.value;
}

describe('RemoveUserFromWorkspaceHandler', () => {
  let handler: RemoveUserFromWorkspaceHandler;
  let workspaceUserRepository: jest.Mocked<WorkspaceUserRepository>;

  beforeEach(async () => {
    workspaceUserRepository = createMockWorkspaceUserRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveUserFromWorkspaceHandler,
        { provide: WorkspaceUserRepository, useValue: workspaceUserRepository },
      ],
    }).compile();

    handler = module.get(RemoveUserFromWorkspaceHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('success', () => {
    it('should remove the user from workspace and return right(null)', async () => {
      const workspaceUser = makeWorkspaceUser();
      workspaceUserRepository.findUserByWorkspaceAndUserId.mockResolvedValue(
        workspaceUser,
      );
      workspaceUserRepository.removeUserFromWorkspace.mockResolvedValue(
        undefined,
      );
      const request = makeRequest();

      const result = await handler.execute(request);

      expect(result.isRight()).toBe(true);
      expect(result.value).toBeNull();
      expect(
        workspaceUserRepository.findUserByWorkspaceAndUserId,
      ).toHaveBeenCalledWith(request.workspaceId, request.userId);
      expect(
        workspaceUserRepository.removeUserFromWorkspace,
      ).toHaveBeenCalledWith(workspaceUser.id);
    });
  });

  describe('failure', () => {
    it('should return left(HttpException 404) when the user is not found in the workspace', async () => {
      workspaceUserRepository.findUserByWorkspaceAndUserId.mockResolvedValue(
        null,
      );
      const request = makeRequest();

      const result = await handler.execute(request);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(HttpException);
      expect((result.value as HttpException).getStatus()).toBe(404);
      expect(
        workspaceUserRepository.removeUserFromWorkspace,
      ).not.toHaveBeenCalled();
    });
  });
});
