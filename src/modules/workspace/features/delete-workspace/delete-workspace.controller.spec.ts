import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from '@providers/auth/guards/Roles.guard';
import { left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { DeleteWorkspaceController } from './delete-workspace.controller';
import { DeleteWorkspaceRequest } from './delete-workspace.dto';
import { DeleteWorkspaceHandler } from './delete-workspace.handler';

function makeParam(
  overrides?: Partial<DeleteWorkspaceRequest>,
): DeleteWorkspaceRequest {
  return {
    workspaceId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    ...overrides,
  };
}

function makeError(message: string, status: number): HttpException {
  return new HttpException(message, status);
}

describe('DeleteWorkspaceController', () => {
  let controller: DeleteWorkspaceController;
  let handler: jest.Mocked<DeleteWorkspaceHandler>;

  beforeEach(async () => {
    const mockHandler = { execute: jest.fn() };

    jest.spyOn(ErrorPresenter, 'toHTTP').mockReturnValue(undefined as never);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeleteWorkspaceController],
      providers: [{ provide: DeleteWorkspaceHandler, useValue: mockHandler }],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(DeleteWorkspaceController);
    handler = module.get(DeleteWorkspaceHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('should call handler with workspaceId and return undefined', async () => {
      const param = makeParam();

      handler.execute.mockResolvedValue(right(null));

      const result = await controller.handle(param);

      expect(handler.execute).toHaveBeenCalledTimes(1);
      expect(handler.execute).toHaveBeenCalledWith({
        workspaceId: param.workspaceId,
      });
      expect(result).toBeUndefined();
    });
  });

  describe('Error Path - Handler returns Left', () => {
    it.each<{ scenario: string; errorMessage: string; errorStatus: number }>([
      {
        scenario: 'workspace not found',
        errorMessage: 'Workspace not found',
        errorStatus: statusCode.NOT_FOUND,
      },
    ])(
      'should delegate to ErrorPresenter when handler fails ($scenario)',
      async ({ errorMessage, errorStatus }) => {
        const param = makeParam();
        const error = makeError(errorMessage, errorStatus);

        handler.execute.mockResolvedValue(left(error));

        await controller.handle(param);

        expect(handler.execute).toHaveBeenCalledTimes(1);
        expect(ErrorPresenter.toHTTP).toHaveBeenCalledWith(error);
      },
    );
  });
});
