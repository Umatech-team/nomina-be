import { UserRole } from '@constants/enums';
import { Workspace } from '@modules/workspace/entities/Workspace';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { left, right } from '@shared/core/errors/Either';
import { ListWorkspacesController } from './list-workspaces.controller';
import { ListWorkspacesRequest } from './list-workspaces.dto';
import { ListWorkspacesHandler } from './list-workspaces.handler';

describe('ListWorkspacesController', () => {
  let controller: ListWorkspacesController;
  let handler: jest.Mocked<ListWorkspacesHandler>;

  const makeSub = () => 'user-id-123';

  const makeQuery = (
    overrides?: Partial<ListWorkspacesRequest>,
  ): ListWorkspacesRequest => ({
    page: 1,
    pageSize: 10,
    ...overrides,
  });

  const makeWorkspace = (
    name = 'My Workspace',
    id = 'workspace-id-123',
  ): Workspace => {
    const result = Workspace.create({ name, currency: 'BRL' }, id);
    if (result.isLeft()) throw new Error('Failed to create workspace');
    return result.value;
  };

  const makeHandlerResponse = (overrides?: {
    workspaces?: Array<{
      workspace: Workspace;
      role: UserRole;
      isDefault: boolean;
    }>;
    total?: number;
  }) => ({
    workspaces: [
      { workspace: makeWorkspace(), role: UserRole.OWNER, isDefault: true },
    ],
    total: 1,
    ...overrides,
  });

  beforeEach(async () => {
    const mockHandler = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListWorkspacesController],
      providers: [{ provide: ListWorkspacesHandler, useValue: mockHandler }],
    }).compile();

    controller = module.get<ListWorkspacesController>(ListWorkspacesController);
    handler = module.get(ListWorkspacesHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle()', () => {
    it('should call handler with merged sub+query and return mapped response on success (Right)', async () => {
      const sub = makeSub();
      const query = makeQuery();
      const handlerResponse = makeHandlerResponse();
      handler.execute.mockResolvedValue(right(handlerResponse));

      const result = await controller.handle({ sub } as never, query);

      const { workspace } = handlerResponse.workspaces[0];
      expect(handler.execute).toHaveBeenCalledTimes(1);
      expect(handler.execute).toHaveBeenCalledWith({ ...query, sub });
      expect(result).toEqual({
        data: {
          workspaces: [
            {
              id: workspace.id,
              name: workspace.name,
              currency: workspace.currency,
              createdAt: workspace.createdAt,
              role: UserRole.OWNER,
              isDefault: true,
            },
          ],
          total: 1,
        },
      });
    });

    it('should map multiple workspace entries and propagate role and isDefault correctly', async () => {
      const sub = makeSub();
      const query = makeQuery({ page: 2, pageSize: 5 });
      const ws1 = makeWorkspace('Workspace A', 'ws-id-1');
      const ws2 = makeWorkspace('Workspace B', 'ws-id-2');
      const handlerResponse = makeHandlerResponse({
        workspaces: [
          { workspace: ws1, role: UserRole.OWNER, isDefault: true },
          { workspace: ws2, role: UserRole.ADMIN, isDefault: false },
        ],
        total: 2,
      });
      handler.execute.mockResolvedValue(right(handlerResponse));

      const result = await controller.handle({ sub } as never, query);

      expect(handler.execute).toHaveBeenCalledWith({ ...query, sub });
      expect(result).toEqual({
        data: {
          workspaces: [
            {
              id: ws1.id,
              name: 'Workspace A',
              currency: 'BRL',
              createdAt: ws1.createdAt,
              role: UserRole.OWNER,
              isDefault: true,
            },
            {
              id: ws2.id,
              name: 'Workspace B',
              currency: 'BRL',
              createdAt: ws2.createdAt,
              role: UserRole.ADMIN,
              isDefault: false,
            },
          ],
          total: 2,
        },
      });
    });

    it('should return an empty workspaces array when handler returns no workspaces', async () => {
      const handlerResponse = makeHandlerResponse({ workspaces: [], total: 0 });
      handler.execute.mockResolvedValue(right(handlerResponse));

      const result = await controller.handle(
        { sub: makeSub() } as never,
        makeQuery(),
      );

      expect(result).toEqual({ data: { workspaces: [], total: 0 } });
    });

    it.each([
      [
        'Not Found (404)',
        new HttpException('Resource not found', HttpStatus.NOT_FOUND),
      ],
      [
        'Unauthorized (401)',
        new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED),
      ],
      [
        'Internal Server Error (500)',
        new HttpException('Unexpected error', HttpStatus.INTERNAL_SERVER_ERROR),
      ],
    ])(
      'should throw when handler returns an error — %s (Left)',
      async (_, errorInstance) => {
        handler.execute.mockResolvedValue(left(errorInstance as never));

        await expect(
          controller.handle({ sub: makeSub() } as never, makeQuery()),
        ).rejects.toThrow(errorInstance.message);
        expect(handler.execute).toHaveBeenCalledTimes(1);
      },
    );
  });
});
