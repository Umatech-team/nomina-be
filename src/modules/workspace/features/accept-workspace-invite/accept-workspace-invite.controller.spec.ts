import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
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
import { AcceptWorkspaceInviteController } from './accept-workspace-invite.controller';
import { AcceptWorkspaceInviteHandler } from './accept-workspace-invite.handler';

function makeRequest(overrides?: Partial<{ code: string }>): { code: string } {
  return {
    code: 'valid-invite-code',
    ...overrides,
  };
}

function makeTokenPayload(
  overrides?: Partial<TokenPayloadSchema>,
): TokenPayloadSchema {
  return {
    sub: 'user-123',
    workspaceId: 'workspace-1',
    role: UserRole.USER,
    ...overrides,
  };
}

function makeWorkspaceUser(
  overrides?: Partial<WorkspaceUserProps>,
  id?: string,
): WorkspaceUser {
  const result = WorkspaceUser.create(
    {
      workspaceId: 'workspace-1',
      userId: 'user-123',
      role: UserRole.USER,
      isDefault: false,
      joinedAt: new Date('2026-03-05'),
      ...overrides,
    },
    id,
  );

  if (result.isLeft()) {
    throw new Error(`makeWorkspaceUser: ${result.value.message}`);
  }

  return result.value;
}

function makeErrorResponse(message: string, status: number): HttpException {
  return new HttpException(message, status);
}

describe('AcceptWorkspaceInviteController', () => {
  let controller: AcceptWorkspaceInviteController;
  let handler: jest.Mocked<AcceptWorkspaceInviteHandler>;
  let module: TestingModule;

  beforeEach(async () => {
    // Mock handler
    const mockHandler = {
      execute: jest.fn(),
    };

    (jest.spyOn(ErrorPresenter, 'toHTTP') as jest.SpyInstance).mockReturnValue(
      undefined,
    );

    jest.spyOn(WorkspaceUserPresenter, 'toHTTP').mockReturnValue({
      id: 'mock-workspace-user',
      workspaceId: 'workspace-1',
      userId: 'user-123',
      role: UserRole.USER,
      joinedAt: new Date('2026-03-05'),
    });

    module = await Test.createTestingModule({
      controllers: [AcceptWorkspaceInviteController],
      providers: [
        {
          provide: AcceptWorkspaceInviteHandler,
          useValue: mockHandler,
        },
      ],
    }).compile();

    controller = module.get(AcceptWorkspaceInviteController);
    handler = module.get(AcceptWorkspaceInviteHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path - Successful invite acceptance', () => {
    it('should return formatted workspace user when handler succeeds', async () => {
      const request = makeRequest();
      const tokenPayload = makeTokenPayload();
      const workspaceUser = makeWorkspaceUser();

      handler.execute.mockResolvedValue(right(workspaceUser));

      const expectedPresenterInput = {
        ...request,
        sub: tokenPayload.sub,
      };

      const result = await controller.handle(tokenPayload, request);
      expect(handler.execute).toHaveBeenCalledWith(expectedPresenterInput);
      expect(handler.execute).toHaveBeenCalledTimes(1);
      expect(WorkspaceUserPresenter.toHTTP).toHaveBeenCalledWith(workspaceUser);
      expect(result).toEqual({
        id: 'mock-workspace-user',
        workspaceId: 'workspace-1',
        userId: 'user-123',
        role: UserRole.USER,
        joinedAt: new Date('2026-03-05'),
      });
    });
  });

  describe('Error Paths - Handler returns Left', () => {
    it.each<{
      scenario: string;
      errorMessage: string;
      errorStatus: number;
    }>([
      {
        scenario: 'Invite not found',
        errorMessage: 'Invite not found',
        errorStatus: statusCode.NOT_FOUND,
      },
      {
        scenario: 'Invite expired',
        errorMessage: 'Invite expired',
        errorStatus: statusCode.BAD_REQUEST,
      },
      {
        scenario: 'Invite already used',
        errorMessage: 'Invite already used',
        errorStatus: statusCode.BAD_REQUEST,
      },
      {
        scenario: 'User already member',
        errorMessage: 'User already a member of the workspace',
        errorStatus: statusCode.CONFLICT,
      },
    ])(
      'should return error presenter response when handler fails ($scenario)',
      async ({ errorMessage, errorStatus }) => {
        const request = makeRequest();
        const tokenPayload = makeTokenPayload();
        const error = makeErrorResponse(errorMessage, errorStatus);

        handler.execute.mockResolvedValue(left(error));
        await controller.handle(tokenPayload, request);
        expect(handler.execute).toHaveBeenCalledWith({
          ...request,
          sub: tokenPayload.sub,
        });
        expect(ErrorPresenter.toHTTP).toHaveBeenCalledWith(error);
      },
    );
  });

  describe('Request/Response Shape Integration', () => {
    it('should pass merged request and token payload to handler', async () => {
      const request = makeRequest({ code: 'unique-code-456' });
      const tokenPayload = makeTokenPayload({ sub: 'user-789' });
      const workspaceUser = makeWorkspaceUser({
        userId: 'user-789',
      });

      handler.execute.mockResolvedValue(right(workspaceUser));

      await controller.handle(tokenPayload, request);

      expect(handler.execute).toHaveBeenCalledWith({
        code: 'unique-code-456',
        sub: 'user-789',
      });
    });

    it('should call WorkspaceUserPresenter with exact response from handler', async () => {
      const request = makeRequest();
      const tokenPayload = makeTokenPayload();
      const customWorkspaceUser = makeWorkspaceUser(
        { role: UserRole.ADMIN },
        'custom-id-999',
      );

      handler.execute.mockResolvedValue(right(customWorkspaceUser));
      await controller.handle(tokenPayload, request);
      expect(WorkspaceUserPresenter.toHTTP).toHaveBeenCalledWith(
        customWorkspaceUser,
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle handler with minimal valid data', async () => {
      const request = makeRequest({ code: 'x' });
      const tokenPayload = makeTokenPayload({ sub: 'u' });
      const minimalWorkspaceUser = makeWorkspaceUser(
        { joinedAt: new Date() },
        'w1',
      );

      handler.execute.mockResolvedValue(right(minimalWorkspaceUser));
      const result = await controller.handle(tokenPayload, request);
      expect(handler.execute).toHaveBeenCalledWith({
        code: 'x',
        sub: 'u',
      });
      expect(result).toEqual({
        id: 'mock-workspace-user',
        workspaceId: 'workspace-1',
        userId: 'user-123',
        role: UserRole.USER,
        joinedAt: new Date('2026-03-05'),
      });
    });

    it('should preserve handler execution order and async flow', async () => {
      const request = makeRequest();
      const tokenPayload = makeTokenPayload();
      const workspaceUser = makeWorkspaceUser();
      handler.execute.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(right(workspaceUser)), 10);
          }),
      );
      const result = await controller.handle(tokenPayload, request);
      expect(handler.execute).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('Presenter Contract Compliance', () => {
    it('should call ErrorPresenter.toHTTP exactly once on error', async () => {
      const request = makeRequest();
      const tokenPayload = makeTokenPayload();
      const error = makeErrorResponse('Test error', statusCode.BAD_REQUEST);

      handler.execute.mockResolvedValue(left(error));
      await controller.handle(tokenPayload, request);
      expect(ErrorPresenter.toHTTP).toHaveBeenCalledTimes(1);
      expect(ErrorPresenter.toHTTP).toHaveBeenCalledWith(error);
    });

    it('should call WorkspaceUserPresenter.toHTTP exactly once on success', async () => {
      const request = makeRequest();
      const tokenPayload = makeTokenPayload();
      const workspaceUser = makeWorkspaceUser();

      handler.execute.mockResolvedValue(right(workspaceUser));
      await controller.handle(tokenPayload, request);
      expect(WorkspaceUserPresenter.toHTTP).toHaveBeenCalledTimes(1);
      expect(WorkspaceUserPresenter.toHTTP).toHaveBeenCalledWith(workspaceUser);
    });

    it('should not call both presenters in same execution', async () => {
      const request = makeRequest();
      const tokenPayload = makeTokenPayload();
      const workspaceUser = makeWorkspaceUser();

      handler.execute.mockResolvedValue(right(workspaceUser));
      await controller.handle(tokenPayload, request);
      expect(ErrorPresenter.toHTTP).not.toHaveBeenCalled();
      expect(WorkspaceUserPresenter.toHTTP).toHaveBeenCalled();
    });
  });
});
