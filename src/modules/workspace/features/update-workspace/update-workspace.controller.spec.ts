import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Workspace } from '@modules/workspace/entities/Workspace';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from '@providers/auth/guards/Roles.guard';
import { left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { UpdateWorkspaceController } from './update-workspace.controller';
import { UpdateWorkspaceRequest } from './update-workspace.dto';
import { UpdateWorkspaceHandler } from './update-workspace.handler';

type ParamRequest = Pick<UpdateWorkspaceRequest, 'workspaceId'>;
type BodyRequest = Omit<UpdateWorkspaceRequest, 'workspaceId'>;

function makeParam(overrides?: Partial<ParamRequest>): ParamRequest {
  return {
    workspaceId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    ...overrides,
  };
}

function makeBody(overrides?: Partial<BodyRequest>): BodyRequest {
  return {
    name: 'My Workspace',
    currency: 'BRL',
    ...overrides,
  };
}

function makeMockWorkspace(): Workspace {
  return new Workspace(
    {
      name: 'My Workspace',
      currency: 'BRL',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    },
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  );
}

describe('UpdateWorkspaceController', () => {
  let controller: UpdateWorkspaceController;
  let handler: jest.Mocked<UpdateWorkspaceHandler>;

  beforeEach(async () => {
    const mockHandler = { execute: jest.fn() };

    jest.spyOn(ErrorPresenter, 'toHTTP').mockReturnValue(undefined as never);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdateWorkspaceController],
      providers: [{ provide: UpdateWorkspaceHandler, useValue: mockHandler }],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(UpdateWorkspaceController);
    handler = module.get(UpdateWorkspaceHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('should call handler with merged param and body, then return presenter output', async () => {
      const param = makeParam();
      const body = makeBody();
      const workspace = makeMockWorkspace();

      handler.execute.mockResolvedValue(right(workspace));

      const result = await controller.handle(param, body);

      expect(handler.execute).toHaveBeenCalledTimes(1);
      expect(handler.execute).toHaveBeenCalledWith({
        ...body,
        workspaceId: param.workspaceId,
      });
      expect(result).toEqual({
        data: {
          id: workspace.id,
          name: workspace.name,
          currency: workspace.currency,
          createdAt: workspace.createdAt,
        },
      });
    });

    it('should not leak Either internals in the successful response', async () => {
      handler.execute.mockResolvedValue(right(makeMockWorkspace()));

      const result = await controller.handle(makeParam(), makeBody());

      expect(result).not.toHaveProperty('isLeft');
      expect(result).not.toHaveProperty('isRight');
    });
  });

  describe('Error Path - Handler returns Left', () => {
    it.each<{ scenario: string; errorMessage: string; errorStatus: number }>([
      {
        scenario: 'workspace not found',
        errorMessage: 'Workspace not found',
        errorStatus: statusCode.NOT_FOUND,
      },
      {
        scenario: 'unauthorized',
        errorMessage: 'Unauthorized',
        errorStatus: statusCode.UNAUTHORIZED,
      },
    ])(
      'should delegate to ErrorPresenter when handler fails ($scenario)',
      async ({ errorMessage, errorStatus }) => {
        const error = new HttpException(errorMessage, errorStatus);

        handler.execute.mockResolvedValue(left(error));

        await controller.handle(makeParam(), makeBody());

        expect(handler.execute).toHaveBeenCalledTimes(1);
        expect(ErrorPresenter.toHTTP).toHaveBeenCalledWith(error);
      },
    );
  });
});
