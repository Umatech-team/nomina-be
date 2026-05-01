import { UserRole } from '@constants/enums';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { CreateWorkspaceService } from './create-workspace.service';

function makeRequest(overrides = {}) {
  return {
    name: 'My Workspace',
    currency: 'BRL',
    isDefault: true,
    sub: 'user-1',
    ...overrides,
  };
}

describe('CreateWorkspaceService', () => {
  let service: CreateWorkspaceService;
  let workspaceRepository: jest.Mocked<WorkspaceRepository>;

  beforeEach(() => {
    workspaceRepository = {
      createWithOwnerAndAccount: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findOwnedByUserId: jest.fn(),
      countOwnedByUserId: jest.fn(),
    } as jest.Mocked<WorkspaceRepository>;

    service = new CreateWorkspaceService(workspaceRepository);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create workspace and workspaceUser successfully', async () => {
    workspaceRepository.createWithOwnerAndAccount.mockResolvedValue();

    const result = await service.execute(makeRequest());
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.workspace).toBeDefined();
      expect(result.value.workspaceUser).toBeDefined();
      expect(result.value.workspaceUser.role).toBe(UserRole.OWNER);
      expect(result.value.workspaceUser.userId).toBe('user-1');
    }
    expect(workspaceRepository.createWithOwnerAndAccount).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should return left when workspace name is too short', async () => {
    const result = await service.execute(makeRequest({ name: 'A' }));
    expect(result.isLeft()).toBe(true);
    expect(
      workspaceRepository.createWithOwnerAndAccount,
    ).not.toHaveBeenCalled();
  });
});
