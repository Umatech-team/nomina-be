import { UserRole } from '@constants/enums';
import { createMockWorkspaceUserRepository } from '@modules/user/test-helpers/mock-factories';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateWorkspaceUserHandler } from './update-workspace-user.handler';

type Request = { workspaceId: string; role: UserRole; sub: string };

function makeRequest(overrides?: Partial<Request>): Request {
  return {
    workspaceId: 'workspace-id-1',
    role: UserRole.ADMIN,
    sub: 'user-id-1',
    ...overrides,
  };
}

function makeWorkspaceUser(role: UserRole = UserRole.ADMIN): WorkspaceUser {
  const result = WorkspaceUser.create({
    workspaceId: 'workspace-id-1',
    userId: 'user-id-1',
    role,
    isDefault: false,
  });
  if (result.isLeft())
    throw new Error(`makeWorkspaceUser: ${result.value.message}`);
  return result.value;
}

describe('UpdateWorkspaceUserHandler', () => {
  let handler: UpdateWorkspaceUserHandler;
  let workspaceUserRepository: jest.Mocked<WorkspaceUserRepository>;

  beforeEach(async () => {
    workspaceUserRepository = createMockWorkspaceUserRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateWorkspaceUserHandler,
        { provide: WorkspaceRepository, useValue: {} },
        { provide: WorkspaceUserRepository, useValue: workspaceUserRepository },
      ],
    }).compile();

    handler = module.get(UpdateWorkspaceUserHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('success', () => {
    it.each([UserRole.ADMIN, UserRole.USER, UserRole.VIEWER])(
      'should update the workspace user role to %s and return right(WorkspaceUser)',
      async (newRole) => {
        const existingUser = makeWorkspaceUser(UserRole.USER);
        const updatedUser = makeWorkspaceUser(newRole);
        workspaceUserRepository.findUserByWorkspaceAndUserId.mockResolvedValue(
          existingUser,
        );
        workspaceUserRepository.updateUser.mockResolvedValue(updatedUser);
        const request = makeRequest({ role: newRole });

        const result = await handler.execute(request);

        expect(result.isRight()).toBe(true);
        expect(result.value).toBeInstanceOf(WorkspaceUser);
        expect(
          workspaceUserRepository.findUserByWorkspaceAndUserId,
        ).toHaveBeenCalledWith(request.workspaceId, request.sub);
        expect(workspaceUserRepository.updateUser).toHaveBeenCalledWith(
          expect.objectContaining({ role: newRole }),
        );
      },
    );
  });

  describe('failure', () => {
    it('should return left(HttpException 403) when user does not belong to the workspace', async () => {
      workspaceUserRepository.findUserByWorkspaceAndUserId.mockResolvedValue(
        null,
      );
      const request = makeRequest();

      const result = await handler.execute(request);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(HttpException);
      expect((result.value as HttpException).getStatus()).toBe(403);
      expect(workspaceUserRepository.updateUser).not.toHaveBeenCalled();
    });

    it('should return left(HttpException 403) when current user has the OWNER role', async () => {
      const ownerUser = makeWorkspaceUser(UserRole.OWNER);
      workspaceUserRepository.findUserByWorkspaceAndUserId.mockResolvedValue(
        ownerUser,
      );
      const request = makeRequest();

      const result = await handler.execute(request);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(HttpException);
      expect((result.value as HttpException).getStatus()).toBe(403);
      expect(workspaceUserRepository.updateUser).not.toHaveBeenCalled();
    });

    it('should return left(HttpException 403) when the requested new role is OWNER', async () => {
      const existingUser = makeWorkspaceUser(UserRole.USER);
      workspaceUserRepository.findUserByWorkspaceAndUserId.mockResolvedValue(
        existingUser,
      );
      const request = makeRequest({ role: UserRole.OWNER });

      const result = await handler.execute(request);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(HttpException);
      expect((result.value as HttpException).getStatus()).toBe(403);
      expect(workspaceUserRepository.updateUser).not.toHaveBeenCalled();
    });
  });
});
