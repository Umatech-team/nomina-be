import { UserRole } from '@constants/enums';
import { RefreshToken } from '@modules/user/entities/RefreshToken';
import { User } from '@modules/user/entities/User';
import { RefreshTokensRepository } from '@modules/user/repositories/contracts/refresh-token.repository';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import { WorkspaceUser } from '@modules/workspace/entities/WorkspaceUser';
import { WorkspaceUserRepository } from '@modules/workspace/repositories/contracts/WorkspaceUserRepository';
import { Decoder } from '@providers/cryptography/contracts/Decoder';
import { Encrypter } from '@providers/cryptography/contracts/Encrypter';
import { HashComparer } from '@providers/cryptography/contracts/HashComparer';
import { HashGenerator } from '@providers/cryptography/contracts/HashGenerator';
import { DateAddition } from '@providers/date/contracts/DateAddition';

/**
 * Mock factory for UserRepository
 */
export const createMockUserRepository = (): jest.Mocked<UserRepository> => ({
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findUniqueById: jest.fn(),
  findUniqueByEmail: jest.fn(),
});

/**
 * Mock factory for RefreshTokensRepository
 */
export const createMockRefreshTokensRepository =
  (): jest.Mocked<RefreshTokensRepository> => ({
    create: jest.fn(),
    findUniqueByUserIdAndToken: jest.fn(),
    delete: jest.fn(),
    deleteManyByUserId: jest.fn(),
  });

/**
 * Mock factory for WorkspaceUserRepository
 */
export const createMockWorkspaceUserRepository =
  (): jest.Mocked<WorkspaceUserRepository> => ({
    findDefaultWorkspaceByUserId: jest.fn(),
    addUserToWorkspace: jest.fn(),
    removeUserFromWorkspace: jest.fn(),
    updateUser: jest.fn(),
    findMembershipById: jest.fn(),
    findUsersByWorkspaceId: jest.fn(),
    findUserByWorkspaceAndUserId: jest.fn(),
  });

/**
 * Mock factory for HashGenerator
 */
export const createMockHashGenerator = (): jest.Mocked<HashGenerator> => ({
  hash: jest
    .fn()
    .mockImplementation((plain: string) => Promise.resolve(`hashed_${plain}`)),
});

/**
 * Mock factory for HashComparer
 */
export const createMockHashComparer = (): jest.Mocked<HashComparer> => ({
  compare: jest.fn().mockResolvedValue(true),
});

/**
 * Mock factory for Encrypter
 */
export const createMockEncrypter = (): jest.Mocked<Encrypter> => ({
  encrypt: jest
    .fn()
    .mockImplementation((payload: Record<string, unknown>) =>
      Promise.resolve(`jwt_token_${JSON.stringify(payload).substring(0, 20)}`),
    ),
});

/**
 * Mock factory for Decoder
 */
export const createMockDecoder = (): jest.Mocked<Decoder> => ({
  decrypt: jest.fn().mockResolvedValue({
    payload: {
      sub: 'user-id-123',
      name: 'John Doe',
      workspaceId: 'workspace-id-123',
      workspaceName: 'My Workspace',
      role: UserRole.OWNER,
    },
    isValid: true,
  }),
});

/**
 * Mock factory for DateAddition
 */
export const createMockDateAddition = (): jest.Mocked<DateAddition> => ({
  addDaysInCurrentDate: jest.fn().mockImplementation((days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }),
  addYearsInCurrentDate: jest.fn().mockImplementation((years: number) => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + years);
    return date;
  }),
});

/**
 * Create a mock User entity for testing
 */
export const createMockUser = (overrides?: Partial<User>): User => {
  const userOrError = User.create(
    {
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed_password_123',
    },
    'user-id-123',
  );

  if (userOrError.isLeft()) {
    throw new Error('Failed to create mock user');
  }

  const user = userOrError.value;

  // Apply overrides if provided
  if (overrides) {
    Object.assign(user, overrides);
  }

  return user;
};

/**
 * Create a mock RefreshToken entity for testing
 */
export const createMockRefreshToken = (
  overrides?: Partial<Omit<RefreshToken, 'id'>>,
): RefreshToken => {
  const expiresIn = new Date();
  expiresIn.setDate(expiresIn.getDate() + 7);

  const baseProps = {
    userId: 'user-id-123',
    token: 'refresh_token_abc123',
    expiresIn,
  };

  // Merge overrides with base props (selecting only the relevant properties)
  const finalProps = { ...baseProps, ...overrides };

  return RefreshToken.create(finalProps, 'refresh-token-id-123');
};

/**
 * Create a mock WorkspaceUser entity for testing
 */
export const createMockWorkspaceUser = (
  overrides?: Partial<WorkspaceUser>,
): WorkspaceUser => {
  const workspaceUserOrError = WorkspaceUser.create(
    {
      workspaceId: 'workspace-id-123',
      userId: 'user-id-123',
      role: UserRole.OWNER,
      isDefault: true,
    },
    'workspace-user-id-123',
  );

  if (workspaceUserOrError.isLeft()) {
    throw new Error('Failed to create mock workspace user');
  }

  const workspaceUser = workspaceUserOrError.value;

  // Apply overrides if provided
  if (overrides) {
    Object.assign(workspaceUser, overrides);
  }

  return workspaceUser;
};

/**
 * Create a mock default workspace result (result of findDefaultWorkspaceByUserId)
 */
export const createMockDefaultWorkspaceResult = (): {
  user: WorkspaceUser;
  workspaceName: string;
} => ({
  user: createMockWorkspaceUser(),
  workspaceName: 'My Workspace',
});
