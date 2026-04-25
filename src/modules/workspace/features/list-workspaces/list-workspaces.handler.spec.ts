import { UserRole } from '@constants/enums';
import { Workspace } from '@modules/workspace/entities/Workspace';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { Test, TestingModule } from '@nestjs/testing';
import { ListWorkspacesRequest } from './list-workspaces.dto';
import { ListWorkspacesService } from './list-workspaces.service';

const USER_ID = 'user-uuid-001';

function makeRequest(
  overrides?: Partial<ListWorkspacesRequest & { sub: string }>,
): ListWorkspacesRequest & { sub: string } {
  return {
    page: 1,
    pageSize: 10,
    sub: USER_ID,
    ...overrides,
  };
}

function makeRepositoryResult(
  count = 2,
): Awaited<ReturnType<WorkspaceRepository['findManyByUserId']>> {
  const workspaces = Array.from({ length: count }, (_, i) => ({
    workspace: { id: `workspace-uuid-00${i + 1}` } as unknown as Workspace,
    role: UserRole.OWNER,
    isDefault: i === 0,
  }));
  return { workspaces, total: count };
}

describe('ListWorkspacesService', () => {
  let service: ListWorkspacesService;
  let workspaceRepository: jest.Mocked<WorkspaceRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListWorkspacesService,
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
      ],
    }).compile();

    service = module.get(ListWorkspacesService);
    workspaceRepository = module.get(WorkspaceRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function arrangeSuccessMocks(count = 2): void {
    workspaceRepository.findManyByUserId.mockResolvedValue(
      makeRepositoryResult(count),
    );
  }

  it('should call findManyByUserId with the correct arguments and return the result', async () => {
    const request = makeRequest({ page: 2, pageSize: 5 });
    arrangeSuccessMocks();

    const result = await service.execute(request);

    expect(workspaceRepository.findManyByUserId).toHaveBeenCalledTimes(1);
    expect(workspaceRepository.findManyByUserId).toHaveBeenCalledWith(
      request.sub,
      request.page,
      request.pageSize,
    );
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.workspaces).toHaveLength(2);
      expect(result.value.total).toBe(2);
    }
  });

  it.each([
    { page: 1, pageSize: 10, count: 0 },
    { page: 1, pageSize: 10, count: 1 },
    { page: 3, pageSize: 50, count: 25 },
  ])(
    'should forward workspaces and total correctly for page=$page pageSize=$pageSize count=$count',
    async ({ page, pageSize, count }) => {
      const request = makeRequest({ page, pageSize });
      workspaceRepository.findManyByUserId.mockResolvedValue(
        makeRepositoryResult(count),
      );

      const result = await service.execute(request);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.workspaces).toHaveLength(count);
        expect(result.value.total).toBe(count);
      }
    },
  );
});
