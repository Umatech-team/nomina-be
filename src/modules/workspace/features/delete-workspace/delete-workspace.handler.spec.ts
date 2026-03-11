import { Workspace } from '@modules/workspace/entities/Workspace';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { statusCode } from '@shared/core/types/statusCode';
import { DeleteWorkspaceRequest } from './delete-workspace.dto';
import { DeleteWorkspaceHandler } from './delete-workspace.handler';

const WORKSPACE_ID = 'workspace-uuid-001';

function makeRequest(
  overrides?: Partial<DeleteWorkspaceRequest>,
): DeleteWorkspaceRequest {
  return {
    workspaceId: WORKSPACE_ID,
    ...overrides,
  };
}

function makeWorkspace(id = WORKSPACE_ID): Workspace {
  return { id } as unknown as Workspace;
}

describe('DeleteWorkspaceHandler', () => {
  let handler: DeleteWorkspaceHandler;
  let workspaceRepository: jest.Mocked<WorkspaceRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteWorkspaceHandler,
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

    handler = module.get(DeleteWorkspaceHandler);
    workspaceRepository = module.get(WorkspaceRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function arrangeSuccessMocks(): void {
    workspaceRepository.findById.mockResolvedValue(makeWorkspace());
    workspaceRepository.delete.mockResolvedValue(undefined);
  }

  describe('execute – Success Cases', () => {
    it('should find workspace, delete it and return Right(null)', async () => {
      arrangeSuccessMocks();
      const request = makeRequest();

      const result = await handler.execute(request);

      expect(result.isRight()).toBe(true);
      expect(result.value).toBeNull();
      expect(workspaceRepository.findById).toHaveBeenCalledTimes(1);
      expect(workspaceRepository.findById).toHaveBeenCalledWith(WORKSPACE_ID);
      expect(workspaceRepository.delete).toHaveBeenCalledTimes(1);
      expect(workspaceRepository.delete).toHaveBeenCalledWith(WORKSPACE_ID);
    });
  });

  describe('execute – Failure Cases', () => {
    it('should return Left(NOT_FOUND) and skip delete when workspace does not exist', async () => {
      workspaceRepository.findById.mockResolvedValue(null);
      const request = makeRequest();

      const result = await handler.execute(request);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(HttpException);
      expect((result.value as HttpException).getStatus()).toBe(
        statusCode.NOT_FOUND,
      );
      expect(workspaceRepository.delete).not.toHaveBeenCalled();
    });
  });
});
