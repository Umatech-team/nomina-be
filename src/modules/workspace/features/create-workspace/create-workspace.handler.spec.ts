import { UserRole } from '@constants/enums';
import { Workspace } from '@modules/workspace/entities/Workspace';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { left } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { CreateWorkspaceRequest } from './create-workspace.dto';
import { CreateWorkspaceService } from './create-workspace.service';

type Request = CreateWorkspaceRequest & Pick<TokenPayloadSchema, 'sub'>;

function makeRequest(
  overrides?: Partial<CreateWorkspaceRequest & Pick<TokenPayloadSchema, 'sub'>>,
): Request {
  return {
    name: 'My Workspace',
    currency: 'BRL',
    isDefault: false,
    sub: 'user-id-123',
    ...overrides,
  };
}

describe('CreateWorkspaceService', () => {
  let service: CreateWorkspaceService;
  let workspaceRepo: jest.Mocked<WorkspaceRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateWorkspaceService,
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

    service = module.get(CreateWorkspaceService);
    workspaceRepo = module.get(WorkspaceRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function arrangeSuccessMocks(): void {
    workspaceRepo.createWithOwnerAndAccount.mockResolvedValue(undefined);
  }

  describe('success', () => {
    it('should create workspace with workspaceUser as OWNER and persist both', async () => {
      arrangeSuccessMocks();
      const request = makeRequest();

      const result = await service.execute(request);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.workspace).toBeInstanceOf(Workspace);
        expect(result.value.workspaceUser).toBeInstanceOf(WorkspaceUser);
        expect(result.value.workspace.name).toBe(request.name);
        expect(result.value.workspace.currency).toBe(request.currency);
        expect(result.value.workspaceUser.userId).toBe(request.sub);
        expect(result.value.workspaceUser.role).toBe(UserRole.OWNER);
        expect(result.value.workspaceUser.isDefault).toBe(false);
      }
      expect(workspaceRepo.createWithOwnerAndAccount).toHaveBeenCalledTimes(1);
      expect(workspaceRepo.createWithOwnerAndAccount).toHaveBeenCalledWith(
        expect.any(Workspace),
        expect.any(WorkspaceUser),
      );
    });

    it('should default currency to BRL when not provided', async () => {
      arrangeSuccessMocks();

      const result = await service.execute(
        makeRequest({ currency: undefined }),
      );

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.workspace.currency).toBe('BRL');
      }
    });

    it('should set isDefault to true on workspaceUser when isDefault is true', async () => {
      arrangeSuccessMocks();

      const result = await service.execute(makeRequest({ isDefault: true }));

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.workspaceUser.isDefault).toBe(true);
      }
    });
  });

  describe('failure', () => {
    it('should return left and not persist when Workspace.create fails', async () => {
      const error = new HttpException(
        'Workspace create error',
        statusCode.BAD_REQUEST,
      );
      jest.spyOn(Workspace, 'create').mockReturnValueOnce(left(error));

      const result = await service.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBe(error);
      expect(workspaceRepo.createWithOwnerAndAccount).not.toHaveBeenCalled();
    });

    it('should return left and not persist when WorkspaceUser.create fails', async () => {
      const error = new HttpException(
        'WorkspaceUser create error',
        statusCode.BAD_REQUEST,
      );
      jest.spyOn(WorkspaceUser, 'create').mockReturnValueOnce(left(error));

      const result = await service.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBe(error);
      expect(workspaceRepo.createWithOwnerAndAccount).not.toHaveBeenCalled();
    });
  });
});
