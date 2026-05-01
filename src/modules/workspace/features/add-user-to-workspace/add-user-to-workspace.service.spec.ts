import { UserRole } from '@constants/enums';
import { User } from '@modules/user/entities/User';
import { UserNotFoundError } from '@modules/user/errors';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { ConflictWorkspaceUserError } from '@modules/workspace/errors';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { AddUserToWorkspaceService } from './add-user-to-workspace.service';

type ServiceRequest = Parameters<
  typeof AddUserToWorkspaceService.prototype.execute
>[0];

function makeRequest(
  overrides: Partial<Record<string, unknown>> = {},
): ServiceRequest {
  return {
    workspaceId: 'ws-1',
    userId: 'user-2',
    role: UserRole.USER,
    sub: 'user-1',
    ...overrides,
  } as ServiceRequest;
}

function makeUser(id = 'user-2'): User {
  const r = User.create(
    {
      name: 'Target User',
      email: 'target@test.com',
      passwordHash: 'hashedpass',
    },
    id,
  );
  if (r.isLeft()) throw r.value;
  return r.value;
}

function makeWorkspaceUser(userId = 'user-1'): WorkspaceUser {
  const r = WorkspaceUser.create({
    workspaceId: 'ws-1',
    userId,
    role: UserRole.OWNER,
    isDefault: true,
  });
  if (r.isLeft()) throw r.value;
  return r.value;
}

describe('AddUserToWorkspaceService', () => {
  let service: AddUserToWorkspaceService;
  let workspaceUserRepository: jest.Mocked<WorkspaceUserRepository>;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    workspaceUserRepository = {
      setDefaultWorkspace: jest.fn(),
      findDefaultWorkspaceByUserId: jest.fn(),
      findOwnerByWorkspaceId: jest.fn(),
      countByWorkspaceId: jest.fn(),
      addUserToWorkspace: jest.fn(),
      removeUserFromWorkspace: jest.fn(),
      updateUser: jest.fn(),
      findMembershipById: jest.fn(),
      findUsersByWorkspaceId: jest.fn(),
      findUserByWorkspaceAndUserId: jest.fn(),
    } as jest.Mocked<WorkspaceUserRepository>;

    userRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUniqueById: jest.fn(),
      findUniqueByEmail: jest.fn(),
    } as jest.Mocked<UserRepository>;

    service = new AddUserToWorkspaceService(
      workspaceUserRepository,
      userRepository,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should return left(UnauthorizedError) when caller is not a workspace member', async () => {
    workspaceUserRepository.findUserByWorkspaceAndUserId.mockResolvedValue(
      null,
    );

    const result = await service.execute(makeRequest());
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedError);
  });

  it('should return left(UserNotFoundError) when target user does not exist', async () => {
    workspaceUserRepository.findUserByWorkspaceAndUserId.mockResolvedValueOnce(
      makeWorkspaceUser(),
    );
    userRepository.findUniqueById.mockResolvedValue(null);

    const result = await service.execute(makeRequest());
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return left(ConflictWorkspaceUserError) when user is already a member', async () => {
    workspaceUserRepository.findUserByWorkspaceAndUserId
      .mockResolvedValueOnce(makeWorkspaceUser('user-1'))
      .mockResolvedValueOnce(makeWorkspaceUser('user-2'));
    userRepository.findUniqueById.mockResolvedValue(makeUser());

    const result = await service.execute(makeRequest());
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ConflictWorkspaceUserError);
  });

  it('should add user and return workspace user on success', async () => {
    workspaceUserRepository.findUserByWorkspaceAndUserId
      .mockResolvedValueOnce(makeWorkspaceUser('user-1'))
      .mockResolvedValueOnce(null);
    userRepository.findUniqueById.mockResolvedValue(makeUser());
    workspaceUserRepository.addUserToWorkspace.mockResolvedValue(
      makeWorkspaceUser(),
    );

    const result = await service.execute(makeRequest());
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.userId).toBe('user-2');
      expect(result.value.role).toBe(UserRole.USER);
    }
    expect(workspaceUserRepository.addUserToWorkspace).toHaveBeenCalledTimes(1);
  });
});
