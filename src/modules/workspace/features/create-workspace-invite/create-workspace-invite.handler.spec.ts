import { UserRole } from '@constants/enums';
import { User } from '@modules/user/entities/User';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import { WorkspaceInvite } from '@modules/workspace/entities/WorkspaceInvite';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { WorkspaceInviteRepository } from '@modules/workspace/repositories/contracts/WorkspaceInviteRepository';
import { WorkspaceRepository } from '@modules/workspace/repositories/contracts/WorkspaceRepository';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { left } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { CreateWorkspaceInviteRequest } from './create-workspace-invite.dto';
import { CreateWorkspaceInviteService } from './create-workspace-invite.service';

type Request = CreateWorkspaceInviteRequest & TokenPayloadSchema;

function makeRequest(overrides?: Partial<Request>): Request {
  return {
    role: UserRole.ADMIN,
    sub: 'user-sub-123',
    workspaceId: 'workspace-id-123',
    ...overrides,
  };
}

function makeUser(): User {
  const result = User.create(
    { name: 'John Doe', email: 'john@example.com', passwordHash: 'hashed' },
    'user-sub-123',
  );
  if (result.isLeft())
    throw new Error(`makeUser failed: ${result.value.message}`);
  return result.value;
}

function makeWorkspaceUser(): WorkspaceUser {
  const result = WorkspaceUser.create({
    workspaceId: 'workspace-id-123',
    userId: 'user-sub-123',
    role: UserRole.OWNER,
    isDefault: true,
  });
  if (result.isLeft())
    throw new Error(`makeWorkspaceUser failed: ${result.value.message}`);
  return result.value;
}

function makeWorkspaceInvite(): WorkspaceInvite {
  const result = WorkspaceInvite.create({
    code: 'ABCD1234',
    workspaceId: 'workspace-id-123',
    role: UserRole.ADMIN,
    createdBy: 'user-sub-123',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48),
  });
  if (result.isLeft())
    throw new Error(`makeWorkspaceInvite failed: ${result.value.message}`);
  return result.value;
}

describe('CreateWorkspaceInviteService', () => {
  let service: CreateWorkspaceInviteService;
  let userRepo: jest.Mocked<UserRepository>;
  let workspaceUserRepo: jest.Mocked<WorkspaceUserRepository>;
  let inviteRepo: jest.Mocked<WorkspaceInviteRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateWorkspaceInviteService,
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findUniqueById: jest.fn(),
            findUniqueByEmail: jest.fn(),
          },
        },
        {
          provide: WorkspaceRepository,
          useValue: {
            create: jest.fn(),
            createWithOwnerAndAccount: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findById: jest.fn(),
            findManyByUserId: jest.fn(),
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
        {
          provide: WorkspaceInviteRepository,
          useValue: {
            create: jest.fn(),
            findByCode: jest.fn(),
            markAsUsed: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(CreateWorkspaceInviteService);
    userRepo = module.get(UserRepository);
    workspaceUserRepo = module.get(WorkspaceUserRepository);
    inviteRepo = module.get(WorkspaceInviteRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function arrangeSuccessMocks(): void {
    userRepo.findUniqueById.mockResolvedValue(makeUser());
    workspaceUserRepo.findUserByWorkspaceAndUserId.mockResolvedValue(
      makeWorkspaceUser(),
    );
    inviteRepo.create.mockResolvedValue(makeWorkspaceInvite());
  }

  describe('success', () => {
    it.each([UserRole.ADMIN, UserRole.USER])(
      'should create and persist invite when role is %s',
      async (role) => {
        arrangeSuccessMocks();
        const request = makeRequest({ role });

        const result = await service.execute(request);

        expect(result.isRight()).toBe(true);
        expect(result.value).toBeInstanceOf(WorkspaceInvite);
        expect(userRepo.findUniqueById).toHaveBeenCalledWith(request.sub);
        expect(
          workspaceUserRepo.findUserByWorkspaceAndUserId,
        ).toHaveBeenCalledWith(request.workspaceId, request.sub);
        expect(inviteRepo.create).toHaveBeenCalledTimes(1);
        expect(inviteRepo.create).toHaveBeenCalledWith(
          expect.any(WorkspaceInvite),
        );
      },
    );
  });

  describe('failure', () => {
    it('should return NOT_FOUND when user does not exist', async () => {
      userRepo.findUniqueById.mockResolvedValue(null);

      const result = await service.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.getStatus()).toBe(statusCode.NOT_FOUND);
      }
      expect(
        workspaceUserRepo.findUserByWorkspaceAndUserId,
      ).not.toHaveBeenCalled();
      expect(inviteRepo.create).not.toHaveBeenCalled();
    });

    it('should return NOT_FOUND when workspace user does not exist', async () => {
      userRepo.findUniqueById.mockResolvedValue(makeUser());
      workspaceUserRepo.findUserByWorkspaceAndUserId.mockResolvedValue(null);

      const result = await service.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.getStatus()).toBe(statusCode.NOT_FOUND);
      }
      expect(inviteRepo.create).not.toHaveBeenCalled();
    });

    it.each([UserRole.OWNER, UserRole.VIEWER])(
      'should return BAD_REQUEST when role is %s',
      async (role) => {
        userRepo.findUniqueById.mockResolvedValue(makeUser());
        workspaceUserRepo.findUserByWorkspaceAndUserId.mockResolvedValue(
          makeWorkspaceUser(),
        );

        const result = await service.execute(makeRequest({ role }));

        expect(result.isLeft()).toBe(true);
        if (result.isLeft()) {
          expect(result.value.getStatus()).toBe(statusCode.BAD_REQUEST);
        }
        expect(inviteRepo.create).not.toHaveBeenCalled();
      },
    );

    it('should propagate error when WorkspaceInvite.create fails', async () => {
      userRepo.findUniqueById.mockResolvedValue(makeUser());
      workspaceUserRepo.findUserByWorkspaceAndUserId.mockResolvedValue(
        makeWorkspaceUser(),
      );
      const error = new HttpException(
        'Invite create failed',
        statusCode.BAD_REQUEST,
      );
      jest.spyOn(WorkspaceInvite, 'create').mockReturnValueOnce(left(error));

      const result = await service.execute(makeRequest());

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBe(error);
      }
      expect(inviteRepo.create).not.toHaveBeenCalled();
    });
  });
});
