import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { left, right } from '@shared/core/errors/Either';
import { SwitchWorkspaceController } from './switch-workspace.controller';
import { SwitchWorkspaceRequest } from './switch-workspace.dto';
import { SwitchWorkspaceHandler } from './switch-workspace.handler';

const USER_ID = 'user-id-abc';

const tokenPayload = { sub: USER_ID } as TokenPayloadSchema;

const makeBody = (
  overrides: Partial<SwitchWorkspaceRequest> = {},
): SwitchWorkspaceRequest => ({
  workspaceId: 'workspace-id-abc',
  ...overrides,
});

const makeTokenResponse = () => ({
  accessToken: 'access-token-value',
  refreshToken: 'refresh-token-value',
});

describe('SwitchWorkspaceController', () => {
  let controller: SwitchWorkspaceController;
  let handler: jest.Mocked<SwitchWorkspaceHandler>;

  beforeEach(async () => {
    const mockHandler = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<SwitchWorkspaceHandler>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwitchWorkspaceController],
      providers: [{ provide: SwitchWorkspaceHandler, useValue: mockHandler }],
    }).compile();

    controller = module.get<SwitchWorkspaceController>(
      SwitchWorkspaceController,
    );
    handler = module.get<SwitchWorkspaceHandler>(
      SwitchWorkspaceHandler,
    ) as jest.Mocked<SwitchWorkspaceHandler>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle – Success', () => {
    it('should call handler.execute with body merged with sub from token', async () => {
      const body = makeBody();
      handler.execute.mockResolvedValue(right(makeTokenResponse()));

      await controller.handle(tokenPayload, body);

      expect(handler.execute).toHaveBeenCalledWith({
        workspaceId: body.workspaceId,
        sub: USER_ID,
      });
    });

    it('should return wrapped token pair on success', async () => {
      const tokenResponse = makeTokenResponse();
      handler.execute.mockResolvedValue(right(tokenResponse));

      const result = await controller.handle(tokenPayload, makeBody());

      expect(result).toEqual({ data: tokenResponse });
    });
  });

  describe('handle – Error', () => {
    it.each([
      [HttpStatus.NOT_FOUND, 'Workspace not found'],
      [HttpStatus.NOT_FOUND, 'Workspace user not found'],
      [HttpStatus.NOT_FOUND, 'User not found'],
      [HttpStatus.FORBIDDEN, 'Forbidden'],
    ])(
      'should throw when handler returns Left with status %i and message "%s"',
      async (status, message) => {
        handler.execute.mockResolvedValue(
          left(new HttpException(message, status)),
        );

        await expect(
          controller.handle(tokenPayload, makeBody()),
        ).rejects.toThrow(HttpException);
      },
    );

    it('should call handler.execute exactly once even on error', async () => {
      handler.execute.mockResolvedValue(
        left(new HttpException('Workspace not found', HttpStatus.NOT_FOUND)),
      );

      await expect(
        controller.handle(tokenPayload, makeBody()),
      ).rejects.toThrow();

      expect(handler.execute).toHaveBeenCalledTimes(1);
    });
  });
});
