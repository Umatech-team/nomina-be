import { UserRole } from '@constants/enums';
import { WorkspaceInvite } from '@modules/workspace/entities/WorkspaceInvite';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { WorkspaceInviteRepository } from '@modules/workspace/repositories/contracts/WorkspaceInviteRepository';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { left } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { AcceptWorkspaceInviteHandler } from './accept-workspace-invite.handler';

type Request = { code: string; sub: string };

function makeRequest(overrides?: Partial<Request>): Request {
  return {
    code: 'invite-code-abc',
    sub: 'user-sub-123',
    ...overrides,
  };
}

function makeWorkspaceInvite(overrides?: {
  expiresAt?: Date;
  usedAt?: Date | null;
  workspaceId?: string;
  role?: UserRole;
}): WorkspaceInvite {
  const result = WorkspaceInvite.create({
    code: 'invite-code-abc',
    workspaceId: overrides?.workspaceId ?? 'workspace-id-1',
    role: overrides?.role ?? UserRole.USER,
    createdBy: 'owner-user-id',
    expiresAt: overrides?.expiresAt ?? new Date(Date.now() + 1000 * 60 * 60),
    usedAt: overrides?.usedAt ?? null,
  });

  if (result.isLeft()) {
    throw new Error(`makeWorkspaceInvite: ${result.value.message}`);
  }

  return result.value;
}

describe('AcceptWorkspaceInviteHandler', () => {
  let handler: AcceptWorkspaceInviteHandler;
  let inviteRepo: jest.Mocked<WorkspaceInviteRepository>;
  let workspaceUserRepo: jest.Mocked<WorkspaceUserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcceptWorkspaceInviteHandler,
        {
          provide: WorkspaceInviteRepository,
          useValue: {
            create: jest.fn(),
            findByCode: jest.fn(),
            markAsUsed: jest.fn(),
          },
        },
        {
          provide: WorkspaceUserRepository,
          useValue: {
            findDefaultWorkspaceByUserId: jest.fn(),
            addUserToWorkspace: jest.fn(),
            removeUserFromWorkspace: jest.fn(),
            updateUser: jest.fn(),
            findMembershipById: jest.fn(),
            findUsersByWorkspaceId: jest.fn(),
            findUserByWorkspaceAndUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(AcceptWorkspaceInviteHandler);
    inviteRepo = module.get(WorkspaceInviteRepository);
    workspaceUserRepo = module.get(WorkspaceUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function arrangeSuccessMocks(invite: WorkspaceInvite): void {
    inviteRepo.findByCode.mockResolvedValue(invite);
    workspaceUserRepo.findUserByWorkspaceAndUserId.mockResolvedValue(null);
    workspaceUserRepo.addUserToWorkspace.mockResolvedValue({} as WorkspaceUser);
    inviteRepo.markAsUsed.mockResolvedValue(undefined);
  }

  describe('success', () => {
    it('should create workspace user, persist it, mark invite as used and return right', async () => {
      const invite = makeWorkspaceInvite({ role: UserRole.ADMIN });
      arrangeSuccessMocks(invite);
      const request = makeRequest();

      const result = await handler.execute(request);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toBeInstanceOf(WorkspaceUser);
        expect(result.value.workspaceId).toBe(invite.workspaceId);
        expect(result.value.userId).toBe(request.sub);
        expect(result.value.role).toBe(invite.role);
        expect(result.value.isDefault).toBe(false);
      }
      expect(inviteRepo.findByCode).toHaveBeenCalledWith(request.code);
      expect(
        workspaceUserRepo.findUserByWorkspaceAndUserId,
      ).toHaveBeenCalledWith(invite.workspaceId, request.sub);
      expect(workspaceUserRepo.addUserToWorkspace).toHaveBeenCalledTimes(1);
      expect(inviteRepo.markAsUsed).toHaveBeenCalledWith(
        invite.id,
        request.sub,
      );
    });
  });

  describe('invite guard failures', () => {
    it.each([
      {
        scenario: 'invite not found',
        setup: (repo: jest.Mocked<WorkspaceInviteRepository>) =>
          repo.findByCode.mockResolvedValue(null),
        expectedMessage: 'Invite not found',
        expectedStatus: statusCode.NOT_FOUND,
      },
      {
        scenario: 'invite is expired',
        setup: (repo: jest.Mocked<WorkspaceInviteRepository>) =>
          repo.findByCode.mockResolvedValue(
            makeWorkspaceInvite({ expiresAt: new Date(Date.now() - 1000) }),
          ),
        expectedMessage: 'Invite expired',
        expectedStatus: statusCode.BAD_REQUEST,
      },
      {
        scenario: 'invite is already used',
        setup: (repo: jest.Mocked<WorkspaceInviteRepository>) =>
          repo.findByCode.mockResolvedValue(
            makeWorkspaceInvite({ usedAt: new Date(Date.now() - 5000) }),
          ),
        expectedMessage: 'Invite already used',
        expectedStatus: statusCode.BAD_REQUEST,
      },
    ])(
      'should return left when $scenario',
      async ({ setup, expectedMessage, expectedStatus }) => {
        setup(inviteRepo);

        const result = await handler.execute(makeRequest());

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(HttpException);
        expect((result.value as HttpException).message).toBe(expectedMessage);
        expect((result.value as HttpException).getStatus()).toBe(
          expectedStatus,
        );
        expect(workspaceUserRepo.addUserToWorkspace).not.toHaveBeenCalled();
        expect(inviteRepo.markAsUsed).not.toHaveBeenCalled();
      },
    );
  });

  describe('membership guard failure', () => {
    it('should return left when user is already a member of the workspace', async () => {
      const invite = makeWorkspaceInvite();
      inviteRepo.findByCode.mockResolvedValue(invite);

      const existingMember = WorkspaceUser.create({
        workspaceId: invite.workspaceId,
        userId: 'user-sub-123',
        role: UserRole.USER,
        isDefault: false,
      });
      if (existingMember.isLeft()) throw new Error('makeWorkspaceUser failed');
      workspaceUserRepo.findUserByWorkspaceAndUserId.mockResolvedValue(
        existingMember.value,
      );

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      expect((result.value as HttpException).message).toBe(
        'User already a member of the workspace',
      );
      expect((result.value as HttpException).getStatus()).toBe(
        statusCode.CONFLICT,
      );
      expect(workspaceUserRepo.addUserToWorkspace).not.toHaveBeenCalled();
      expect(inviteRepo.markAsUsed).not.toHaveBeenCalled();
    });
  });

  describe('entity creation failure', () => {
    it('should return left when WorkspaceUser.create fails', async () => {
      const invite = makeWorkspaceInvite();
      arrangeSuccessMocks(invite);

      const entityError = new HttpException(
        'ID do workspace é obrigatório',
        statusCode.BAD_REQUEST,
      );
      jest
        .spyOn(WorkspaceUser, 'create')
        .mockReturnValueOnce(left(entityError));

      const result = await handler.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      expect((result.value as HttpException).getStatus()).toBe(
        statusCode.BAD_REQUEST,
      );
      expect(workspaceUserRepo.addUserToWorkspace).not.toHaveBeenCalled();
      expect(inviteRepo.markAsUsed).not.toHaveBeenCalled();
    });
  });
});
