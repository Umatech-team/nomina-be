import { UserRole } from '@constants/enums';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { WorkspaceUserNotFoundError } from '@modules/workspace/errors';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { RemoveUserFromWorkspaceService } from './remove-user-from-workspace.service';

type ServiceRequest = Parameters<
  typeof RemoveUserFromWorkspaceService.prototype.execute
>[0];

function makeRequest(
  overrides: Partial<Record<string, unknown>> = {},
): ServiceRequest {
  return {
    workspaceId: 'ws-1',
    userId: 'user-2',
    ...overrides,
  } as ServiceRequest;
}

function makeWorkspaceUser(): WorkspaceUser {
  const r = WorkspaceUser.create(
    {
      workspaceId: 'ws-1',
      userId: 'user-2',
      role: UserRole.USER,
      isDefault: false,
    },
    'wu-1',
  );
  if (r.isLeft()) throw r.value;
  return r.value;
}

describe('RemoveUserFromWorkspaceService', () => {
  let service: RemoveUserFromWorkspaceService;
  let workspaceUserRepository: jest.Mocked<WorkspaceUserRepository>;

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

    service = new RemoveUserFromWorkspaceService(workspaceUserRepository);
  });

  afterEach(() => jest.clearAllMocks());

  it('should return left(WorkspaceUserNotFoundError) when user is not a member', async () => {
    workspaceUserRepository.findUserByWorkspaceAndUserId.mockResolvedValue(
      null,
    );

    const result = await service.execute(makeRequest());
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(WorkspaceUserNotFoundError);
  });

  it('should remove user and return right', async () => {
    workspaceUserRepository.findUserByWorkspaceAndUserId.mockResolvedValue(
      makeWorkspaceUser(),
    );
    workspaceUserRepository.removeUserFromWorkspace.mockResolvedValue();

    const result = await service.execute(makeRequest());
    expect(result.isRight()).toBe(true);
    expect(
      workspaceUserRepository.removeUserFromWorkspace,
    ).toHaveBeenCalledWith('wu-1');
  });
});
