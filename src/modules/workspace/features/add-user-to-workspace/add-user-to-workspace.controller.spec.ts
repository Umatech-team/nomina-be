import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import {
    WorkspaceUser,
    WorkspaceUserProps,
} from '@modules/workspace/entities/WorkspaceUser';
import { WorkspaceUserPresenter } from '@modules/workspace/presenters/WorkspaceUser.presenter';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { AddUserToWorkspaceController } from './add-user-to-workspace.controller';
import { AddUserToWorkspaceService } from './add-user-to-workspace.service';

type BodyRequest = { userId: string; role: UserRole };
type ParamRequest = Pick<{ workspaceId: string }, 'workspaceId'>;

function makeBody(overrides?: Partial<BodyRequest>): BodyRequest {
  return {
    userId: 'user-456',
    role: UserRole.USER,
    ...overrides,
  };
}

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
    sub: 'owner-user-123',
    workspaceId: 'workspace-123',
    role: UserRole.OWNER,
    ...overrides,
  };
}

function makeWorkspaceUser(
  overrides?: Partial<WorkspaceUserProps>,
  id?: string,
): WorkspaceUser {
  const result = WorkspaceUser.create(
    {
      workspaceId: 'workspace-123',
      userId: 'user-456',
      role: UserRole.USER,
      isDefault: false,
      joinedAt: new Date('2026-03-05'),
      ...overrides,
    },
    id ?? 'workspace-user-id-001',
  );

  if (result.isLeft()) {
    throw new Error(`makeWorkspaceUser: ${result.value.message}`);
  }

  return result.value;
}

function makeError(message: string, status: number): HttpException {
  return new HttpException(message, status);
}

describe('AddUserToWorkspaceController', () => {
  let controller: AddUserToWorkspaceController;
  let service: jest.Mocked<AddUserToWorkspaceService>;

  beforeEach(async () => {
    const mockService = { execute: jest.fn() };

    jest.spyOn(ErrorPresenter, 'toHTTP').mockReturnValue(undefined as never);
    jest.spyOn(WorkspaceUserPresenter, 'toHTTP').mockReturnValue({
      id: 'workspace-user-id-001',
      workspaceId: 'workspace-123',
      userId: 'user-456',
      role: UserRole.USER,
      joinedAt: new Date('2026-03-05'),
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddUserToWorkspaceController],
      providers: [
        {
          provide: AddUserToWorkspaceService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get(AddUserToWorkspaceController);
    service = module.get(AddUserToWorkspaceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('should call service with merged body, workspaceId and sub and return wrapped presenter output', async () => {
      const body = makeBody();
      const param = makeParam();
      const token = makeTokenPayload();
      const workspaceUser = makeWorkspaceUser();

      service.execute.mockResolvedValue(right(workspaceUser));

      const result = await controller.handle(token, param, body);

      expect(service.execute).toHaveBeenCalledTimes(1);
      expect(service.execute).toHaveBeenCalledWith({
        ...body,
        workspaceId: param.workspaceId,
        sub: token.sub,
      });
      expect(WorkspaceUserPresenter.toHTTP).toHaveBeenCalledWith(workspaceUser);
      expect(result).toEqual({
        data: {
          id: 'workspace-user-id-001',
          workspaceId: 'workspace-123',
          userId: 'user-456',
          role: UserRole.USER,
          joinedAt: new Date('2026-03-05'),
        },
      });
    });
  });

  describe('Error Paths - Service returns Left', () => {
    it.each<{ scenario: string; errorMessage: string; errorStatus: number }>([
      {
        scenario: 'current user is not a workspace member',
        errorMessage:
          'Current user is not a member of the workspace or workspace not found',
        errorStatus: statusCode.FORBIDDEN,
      },
      {
        scenario: 'target user not found',
        errorMessage: 'User not found',
        errorStatus: statusCode.NOT_FOUND,
      },
      {
        scenario: 'target user already a member',
        errorMessage: 'User is already a member of the workspace',
        errorStatus: statusCode.CONFLICT,
      },
    ])(
      'should delegate to ErrorPresenter when service fails ($scenario)',
      async ({ errorMessage, errorStatus }) => {
        const body = makeBody();
        const param = makeParam();
        const token = makeTokenPayload();
        const error = makeError(errorMessage, errorStatus);

        service.execute.mockResolvedValue(left(error));

        await controller.handle(token, param, body);

        expect(service.execute).toHaveBeenCalledWith({
          ...body,
          workspaceId: param.workspaceId,
          sub: token.sub,
        });
        expect(ErrorPresenter.toHTTP).toHaveBeenCalledWith(error);
        expect(WorkspaceUserPresenter.toHTTP).not.toHaveBeenCalled();
      },
    );
  });

  describe('Request Propagation', () => {
    it('should use workspaceId from param, not from token', async () => {
      const body = makeBody({ userId: 'user-xyz', role: UserRole.ADMIN });
      const param = makeParam({ workspaceId: 'ws-from-param' });
      const token = makeTokenPayload({
        sub: 'owner-abc',
        workspaceId: 'ws-from-token',
      });
      const workspaceUser = makeWorkspaceUser({
        workspaceId: 'ws-from-param',
        userId: 'user-xyz',
        role: UserRole.ADMIN,
      });

      service.execute.mockResolvedValue(right(workspaceUser));

      await controller.handle(token, param, body);

      expect(service.execute).toHaveBeenCalledWith({
        userId: 'user-xyz',
        role: UserRole.ADMIN,
        workspaceId: 'ws-from-param',
        sub: 'owner-abc',
      });
    });

    it('should pass the exact workspaceUser returned by the service to WorkspaceUserPresenter', async () => {
      const body = makeBody();
      const param = makeParam();
      const token = makeTokenPayload();
      const distinguishedUser = makeWorkspaceUser(
        { role: UserRole.ADMIN },
        'distinct-id-999',
      );

      service.execute.mockResolvedValue(right(distinguishedUser));

      await controller.handle(token, param, body);

      expect(WorkspaceUserPresenter.toHTTP).toHaveBeenCalledWith(
        distinguishedUser,
      );
    });
  });

  describe('Presenter Contract Compliance', () => {
    it('should call ErrorPresenter.toHTTP exactly once and not WorkspaceUserPresenter on error', async () => {
      const error = makeError('Some error', statusCode.BAD_REQUEST);
      service.execute.mockResolvedValue(left(error));

      await controller.handle(makeTokenPayload(), makeParam(), makeBody());

      expect(ErrorPresenter.toHTTP).toHaveBeenCalledTimes(1);
      expect(WorkspaceUserPresenter.toHTTP).not.toHaveBeenCalled();
    });

    it('should call WorkspaceUserPresenter.toHTTP exactly once and not ErrorPresenter on success', async () => {
      const workspaceUser = makeWorkspaceUser();
      service.execute.mockResolvedValue(right(workspaceUser));

      await controller.handle(makeTokenPayload(), makeParam(), makeBody());

      expect(WorkspaceUserPresenter.toHTTP).toHaveBeenCalledTimes(1);
      expect(ErrorPresenter.toHTTP).not.toHaveBeenCalled();
    });
  });
});
