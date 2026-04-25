import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import {
    WorkspaceUser,
    WorkspaceUserProps,
} from '@modules/workspace/entities/WorkspaceUser';
import { WorkspaceUserPresenter } from '@modules/workspace/presenters/WorkspaceUser.presenter';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from '@providers/auth/guards/Roles.guard';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { UpdateWorkspaceUserController } from './update-workspace-user.controller';
import type { UpdateWorkspaceUserRequest } from './update-workspace-user.dto';
import { UpdateWorkspaceUserService } from './update-workspace-user.service';

type ParamRequest = Pick<UpdateWorkspaceUserRequest, 'workspaceId'>;

function makeTokenPayload(
  overrides?: Partial<TokenPayloadSchema>,
): TokenPayloadSchema {
  return {
    sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    workspaceId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    role: UserRole.ADMIN,
    ...overrides,
  };
}

function makeParam(overrides?: Partial<ParamRequest>): ParamRequest {
  return {
    workspaceId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    ...overrides,
  };
}

function makeBody(
  overrides?: Partial<UpdateWorkspaceUserRequest>,
): UpdateWorkspaceUserRequest {
  return {
    workspaceId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    role: UserRole.ADMIN,
    ...overrides,
  };
}

function makeWorkspaceUser(
  overrides?: Partial<WorkspaceUserProps>,
  id?: string,
): WorkspaceUser {
  const result = WorkspaceUser.create(
    {
      workspaceId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      role: UserRole.ADMIN,
      isDefault: false,
      joinedAt: new Date('2026-01-01T00:00:00.000Z'),
      ...overrides,
    },
    id ?? 'c1ebc99a-1c0b-4ef8-bb6d-7cc9bd380b22',
  );

  if (result.isLeft()) {
    throw new Error(`makeWorkspaceUser: ${result.value.message}`);
  }

  return result.value;
}

describe('UpdateWorkspaceUserController', () => {
  let controller: UpdateWorkspaceUserController;
  let service: jest.Mocked<UpdateWorkspaceUserService>;

  beforeEach(async () => {
    const mockService = { execute: jest.fn() };

    jest.spyOn(ErrorPresenter, 'toHTTP').mockReturnValue(undefined as never);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdateWorkspaceUserController],
      providers: [
        { provide: UpdateWorkspaceUserService, useValue: mockService },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(UpdateWorkspaceUserController);
    service = module.get(UpdateWorkspaceUserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('should call service with merged token, param and body, then return presenter output', async () => {
      const token = makeTokenPayload();
      const param = makeParam();
      const body = makeBody();
      const workspaceUser = makeWorkspaceUser();

      service.execute.mockResolvedValue(right(workspaceUser));

      const result = await controller.handle(token, param, body);

      expect(service.execute).toHaveBeenCalledTimes(1);
      expect(service.execute).toHaveBeenCalledWith({
        ...body,
        workspaceId: param.workspaceId,
        sub: token.sub,
      });
      expect(result).toEqual({
        data: WorkspaceUserPresenter.toHTTP(workspaceUser),
      });
    });

    it('should not leak Either internals in the successful response', async () => {
      service.execute.mockResolvedValue(right(makeWorkspaceUser()));

      const result = await controller.handle(
        makeTokenPayload(),
        makeParam(),
        makeBody(),
      );

      expect(result).not.toHaveProperty('isLeft');
      expect(result).not.toHaveProperty('isRight');
    });
  });

  describe('Error Path - Service returns Left', () => {
    it.each<{ scenario: string; errorMessage: string; errorStatus: number }>([
      {
        scenario: 'user does not belong to workspace',
        errorMessage: 'User does not belong to this workspace',
        errorStatus: statusCode.FORBIDDEN,
      },
      {
        scenario: 'cannot change the role of the owner',
        errorMessage: 'Cannot change the role of the owner',
        errorStatus: statusCode.FORBIDDEN,
      },
      {
        scenario: 'cannot promote user to owner',
        errorMessage: 'Cannot promote user to owner',
        errorStatus: statusCode.FORBIDDEN,
      },
    ])(
      'should delegate to ErrorPresenter when service fails ($scenario)',
      async ({ errorMessage, errorStatus }) => {
        const error = new HttpException(errorMessage, errorStatus);

        service.execute.mockResolvedValue(left(error));

        await controller.handle(makeTokenPayload(), makeParam(), makeBody());

        expect(service.execute).toHaveBeenCalledTimes(1);
        expect(ErrorPresenter.toHTTP).toHaveBeenCalledWith(error);
      },
    );
  });
});
