import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { Workspace } from '@modules/workspace/entities/Workspace';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { FindWorkspaceController } from './find-workspace.controller';
import { FindWorkspaceByIdService } from './find-workspace.service';

type ParamRequest = { workspaceId: string };

function makeParam(overrides?: Partial<ParamRequest>): ParamRequest {
  return {
    workspaceId: 'workspace-123',
    ...overrides,
  };
}

function makeTokenPayload(
  overrides?: Partial<TokenPayloadSchema>,
): TokenPayloadSchema {
  return {
    sub: 'user-abc',
    workspaceId: 'workspace-123',
    role: UserRole.OWNER,
    ...overrides,
  };
}

function makeWorkspace(id = 'workspace-123'): Workspace {
  const result = Workspace.create(
    {
      name: 'My Workspace',
      currency: 'BRL',
      createdAt: new Date('2026-01-01'),
    },
    id,
  );
  if (result.isLeft()) throw new Error('makeWorkspace failed');
  return result.value;
}

function makeWorkspaceUser(role = UserRole.OWNER): WorkspaceUser {
  const result = WorkspaceUser.create(
    {
      workspaceId: 'workspace-123',
      userId: 'user-abc',
      role,
      isDefault: true,
      joinedAt: new Date('2026-01-01'),
    },
    'workspace-user-001',
  );
  if (result.isLeft()) throw new Error('makeWorkspaceUser failed');
  return result.value;
}

describe('FindWorkspaceController', () => {
  let controller: FindWorkspaceController;
  let service: jest.Mocked<FindWorkspaceByIdService>;

  beforeEach(async () => {
    const mockService = { execute: jest.fn() };

    jest.spyOn(ErrorPresenter, 'toHTTP').mockReturnValue(undefined as never);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FindWorkspaceController],
      providers: [
        {
          provide: FindWorkspaceByIdService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get(FindWorkspaceController);
    service = module.get(FindWorkspaceByIdService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('should call service with workspaceId and sub, then return workspace and role', async () => {
      const param = makeParam();
      const token = makeTokenPayload();
      const workspace = makeWorkspace();
      const workspaceUser = makeWorkspaceUser(UserRole.OWNER);

      service.execute.mockResolvedValue(
        right({ workspace, role: workspaceUser.role }),
      );

      const result = await controller.handle(token, param);

      expect(service.execute).toHaveBeenCalledTimes(1);
      expect(service.execute).toHaveBeenCalledWith({
        workspaceId: param.workspaceId,
        sub: token.sub,
      });
      expect(result).toEqual({
        data: {
          workspace,
          role: UserRole.OWNER,
        },
      });
    });
  });

  describe('Error Paths - Service returns Left', () => {
    it.each<{ scenario: string; message: string; status: number }>([
      {
        scenario: 'workspace not found',
        message: 'Workspace not found',
        status: statusCode.NOT_FOUND,
      },
      {
        scenario: 'user is not a member of the workspace',
        message: 'Unauthorized',
        status: statusCode.UNAUTHORIZED,
      },
    ])(
      'should delegate to ErrorPresenter when $scenario',
      async ({ message, status }) => {
        const param = makeParam();
        const token = makeTokenPayload();
        const error = new HttpException(message, status);

        service.execute.mockResolvedValue(left(error));

        await controller.handle(token, param);

        expect(ErrorPresenter.toHTTP).toHaveBeenCalledTimes(1);
        expect(ErrorPresenter.toHTTP).toHaveBeenCalledWith(error);
      },
    );
  });
});
