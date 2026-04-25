import { Workspace } from '@modules/workspace/entities/Workspace';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { UpdateWorkspaceRequest } from './update-workspace.dto';
import { UpdateWorkspaceService } from './update-workspace.service';

type Request = UpdateWorkspaceRequest & Pick<TokenPayloadSchema, 'workspaceId'>;

function makeRequest(overrides?: Partial<Request>): Request {
  return {
    name: 'My Workspace',
    currency: 'BRL',
    workspaceId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    ...overrides,
  };
}

function makeWorkspace(overrides?: {
  name?: string;
  currency?: string;
}): Workspace {
  return new Workspace(
    {
      name: overrides?.name ?? 'Old Name',
      currency: overrides?.currency ?? 'USD',
      createdAt: new Date(),
    },
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  );
}

describe('UpdateWorkspaceService', () => {
  let service: UpdateWorkspaceService;
  let workspaceRepo: jest.Mocked<WorkspaceRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateWorkspaceService,
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

    service = module.get(UpdateWorkspaceService);
    workspaceRepo = module.get(WorkspaceRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function arrangeSuccessMocks(workspace = makeWorkspace()): Workspace {
    workspaceRepo.findById.mockResolvedValue(workspace);
    workspaceRepo.update.mockResolvedValue(workspace);
    return workspace;
  }

  describe('success', () => {
    it('should update name and currency, persist the workspace, and return right', async () => {
      const workspace = arrangeSuccessMocks();
      const request = makeRequest({ name: 'New Name', currency: 'EUR' });

      const result = await service.execute(request);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toBe(workspace);
        expect(result.value.name).toBe('New Name');
        expect(result.value.currency).toBe('EUR');
      }
      expect(workspaceRepo.findById).toHaveBeenCalledWith(request.workspaceId);
      expect(workspaceRepo.update).toHaveBeenCalledWith(workspace);
    });

    it('should default currency to BRL and persist when currency is not provided', async () => {
      arrangeSuccessMocks();

      const result = await service.execute(
        makeRequest({ currency: undefined }),
      );

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.currency).toBe('BRL');
      }
      expect(workspaceRepo.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('failure', () => {
    it('should return left with NOT_FOUND and not call update when workspace does not exist', async () => {
      workspaceRepo.findById.mockResolvedValue(null);

      const result = await service.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(HttpException);
        expect((result.value as HttpException).getStatus()).toBe(
          statusCode.NOT_FOUND,
        );
      }
      expect(workspaceRepo.update).not.toHaveBeenCalled();
    });
  });
});
