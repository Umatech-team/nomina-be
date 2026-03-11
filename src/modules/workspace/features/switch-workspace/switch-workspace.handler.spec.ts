import { RefreshTokensRepository } from '@modules/user/repositories/contracts/refresh-token.repository';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import {
  createMockDateAddition,
  createMockEncrypter,
  createMockRefreshTokensRepository,
  createMockUser,
  createMockUserRepository,
  createMockWorkspaceUser,
  createMockWorkspaceUserRepository,
} from '@modules/user/test-helpers/mock-factories';
import { Workspace } from '@modules/workspace/entities/Workspace';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Encrypter } from '@providers/cryptography/contracts/Encrypter';
import { DateAddition } from '@providers/date/contracts/DateAddition';
import { statusCode } from '@shared/core/types/statusCode';
import { SwitchWorkspaceRequest } from './switch-workspace.dto';
import { SwitchWorkspaceHandler } from './switch-workspace.handler';

const WORKSPACE_ID = 'workspace-id-123';
const USER_ID = 'user-id-123';

type FullRequest = SwitchWorkspaceRequest & { sub: string };

function makeRequest(overrides?: Partial<FullRequest>): FullRequest {
  return {
    workspaceId: WORKSPACE_ID,
    sub: USER_ID,
    ...overrides,
  };
}

function makeWorkspace(id = WORKSPACE_ID): Workspace {
  return { id, name: 'Test Workspace' } as unknown as Workspace;
}

describe('SwitchWorkspaceHandler', () => {
  let handler: SwitchWorkspaceHandler;
  let workspaceRepository: jest.Mocked<WorkspaceRepository>;
  let workspaceUserRepository: jest.Mocked<WorkspaceUserRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let encrypter: jest.Mocked<Encrypter>;
  let refreshTokensRepository: jest.Mocked<
    ReturnType<typeof createMockRefreshTokensRepository>
  >;
  let dateAddition: jest.Mocked<DateAddition>;

  const mockUser = createMockUser();
  const mockWorkspaceUser = createMockWorkspaceUser();

  function arrangeSuccessMocks(): void {
    workspaceRepository.findById.mockResolvedValue(makeWorkspace());
    workspaceUserRepository.findUserByWorkspaceAndUserId.mockResolvedValue(
      mockWorkspaceUser,
    );
    userRepository.findUniqueById.mockResolvedValue(mockUser);
    encrypter.encrypt
      .mockResolvedValueOnce('access_token_abc')
      .mockResolvedValueOnce('refresh_token_xyz');
    dateAddition.addDaysInCurrentDate.mockReturnValue(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );
    refreshTokensRepository.deleteManyByUserId.mockResolvedValue(undefined);
    refreshTokensRepository.create.mockResolvedValue(undefined);
  }

  beforeEach(async () => {
    workspaceUserRepository = createMockWorkspaceUserRepository();
    userRepository = createMockUserRepository();
    refreshTokensRepository = createMockRefreshTokensRepository();
    encrypter = createMockEncrypter();
    dateAddition = createMockDateAddition();

    workspaceRepository = {
      create: jest.fn(),
      createWithOwnerAndAccount: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findManyByUserId: jest.fn(),
    } as jest.Mocked<WorkspaceRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SwitchWorkspaceHandler,
        { provide: WorkspaceRepository, useValue: workspaceRepository },
        { provide: WorkspaceUserRepository, useValue: workspaceUserRepository },
        { provide: UserRepository, useValue: userRepository },
        { provide: Encrypter, useValue: encrypter },
        { provide: RefreshTokensRepository, useValue: refreshTokensRepository },
        { provide: DateAddition, useValue: dateAddition },
      ],
    }).compile();

    handler = module.get<SwitchWorkspaceHandler>(SwitchWorkspaceHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute() – Success', () => {
    it('should orchestrate full switch-workspace flow and return tokens (Right)', async () => {
      arrangeSuccessMocks();
      const request = makeRequest();

      const result = await handler.execute(request);

      expect(result.isRight()).toBe(true);
      const value = result.value as {
        accessToken: string;
        refreshToken: string;
      };
      expect(value.accessToken).toBe('access_token_abc');
      expect(value.refreshToken).toBe('refresh_token_xyz');

      expect(workspaceRepository.findById).toHaveBeenCalledWith(WORKSPACE_ID);
      expect(
        workspaceUserRepository.findUserByWorkspaceAndUserId,
      ).toHaveBeenCalledWith(WORKSPACE_ID, USER_ID);
      expect(userRepository.findUniqueById).toHaveBeenCalledWith(USER_ID);
      expect(refreshTokensRepository.deleteManyByUserId).toHaveBeenCalledWith(
        USER_ID,
      );
      expect(encrypter.encrypt).toHaveBeenCalledTimes(2);
      expect(refreshTokensRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should encrypt accessToken with full workspace context payload', async () => {
      arrangeSuccessMocks();

      await handler.execute(makeRequest());

      const [firstEncryptCall] = encrypter.encrypt.mock.calls;
      expect(firstEncryptCall[0]).toMatchObject({
        sub: mockUser.id,
        name: mockUser.name,
        workspaceId: WORKSPACE_ID,
        workspaceName: makeWorkspace().name,
        role: mockWorkspaceUser.role,
      });
    });

    it('should encrypt refreshToken with only sub payload', async () => {
      arrangeSuccessMocks();

      await handler.execute(makeRequest());

      const [, secondEncryptCall] = encrypter.encrypt.mock.calls;
      expect(secondEncryptCall[0]).toEqual({ sub: mockUser.id });
    });
  });

  describe('execute()  Failure', () => {
    it.each([
      [
        'workspace not found',
        () => {
          workspaceRepository.findById.mockResolvedValue(null);
        },
        () => {
          expect(
            workspaceUserRepository.findUserByWorkspaceAndUserId,
          ).not.toHaveBeenCalled();
          expect(userRepository.findUniqueById).not.toHaveBeenCalled();
          expect(encrypter.encrypt).not.toHaveBeenCalled();
        },
      ],
      [
        'workspace user not found',
        () => {
          workspaceRepository.findById.mockResolvedValue(makeWorkspace());
          workspaceUserRepository.findUserByWorkspaceAndUserId.mockResolvedValue(
            null,
          );
        },
        () => {
          expect(userRepository.findUniqueById).not.toHaveBeenCalled();
          expect(encrypter.encrypt).not.toHaveBeenCalled();
        },
      ],
      [
        'user not found',
        () => {
          workspaceRepository.findById.mockResolvedValue(makeWorkspace());
          workspaceUserRepository.findUserByWorkspaceAndUserId.mockResolvedValue(
            mockWorkspaceUser,
          );
          userRepository.findUniqueById.mockResolvedValue(null);
        },
        () => {
          expect(encrypter.encrypt).not.toHaveBeenCalled();
          expect(
            refreshTokensRepository.deleteManyByUserId,
          ).not.toHaveBeenCalled();
        },
      ],
    ])(
      'should return Left(NOT_FOUND) when %s',
      async (_label, arrange, assertSideEffects) => {
        arrange();

        const result = await handler.execute(makeRequest());

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(HttpException);
        expect((result.value as HttpException).getStatus()).toBe(
          statusCode.NOT_FOUND,
        );
        assertSideEffects();
      },
    );
  });
});
