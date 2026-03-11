import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from '@providers/auth/guards/Roles.guard';
import { left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { RemoveUserFromWorkspaceController } from './remove-user-from-workspace.controller';
import { RemoveWorkspaceRequest } from './remove-user-from-workspace.dto';
import { RemoveUserFromWorkspaceHandler } from './remove-user-from-workspace.handler';

function makeParam(
  overrides?: Partial<RemoveWorkspaceRequest>,
): RemoveWorkspaceRequest {
  return {
    workspaceId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    userId: 'a1b2c3d4-58cc-4372-a567-0e02b2c3d479',
    ...overrides,
  };
}

function makeError(message: string, status: number): HttpException {
  return new HttpException(message, status);
}

describe('RemoveUserFromWorkspaceController', () => {
  let controller: RemoveUserFromWorkspaceController;
  let handler: jest.Mocked<RemoveUserFromWorkspaceHandler>;

  beforeEach(async () => {
    const mockHandler = { execute: jest.fn() };

    jest.spyOn(ErrorPresenter, 'toHTTP').mockReturnValue(undefined as never);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RemoveUserFromWorkspaceController],
      providers: [
        { provide: RemoveUserFromWorkspaceHandler, useValue: mockHandler },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(RemoveUserFromWorkspaceController);
    handler = module.get(RemoveUserFromWorkspaceHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('should call handler with workspaceId and userId and return undefined', async () => {
      const param = makeParam();

      handler.execute.mockResolvedValue(right(null));

      const result = await controller.handle(param);

      expect(handler.execute).toHaveBeenCalledTimes(1);
      expect(handler.execute).toHaveBeenCalledWith({
        workspaceId: param.workspaceId,
        userId: param.userId,
      });
      expect(result).toBeUndefined();
    });
  });

  describe('Error Path - Handler returns Left', () => {
    it.each<{ scenario: string; errorMessage: string; errorStatus: number }>([
      {
        scenario: 'user not found in workspace',
        errorMessage: 'Usuário não encontrado no workspace',
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
