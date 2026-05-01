import { UserRole } from '@constants/enums';
import { WorkspaceUser } from './WorkspaceUser';

describe('WorkspaceUser entity', () => {
  function makeProps(
    overrides: Partial<Parameters<typeof WorkspaceUser.create>[0]> = {},
  ) {
    return {
      workspaceId: 'ws-1',
      userId: 'user-1',
      role: UserRole.USER,
      isDefault: false,
      ...overrides,
    };
  }

  function makeWorkspaceUser(overrides = {}) {
    const result = WorkspaceUser.create(makeProps(overrides));
    if (result.isLeft()) throw result.value;
    return result.value;
  }

  describe('create()', () => {
    it('should create a valid workspace user', () => {
      expect(WorkspaceUser.create(makeProps()).isRight()).toBe(true);
    });

    it('should default joinedAt to now when not provided', () => {
      const before = new Date();
      const user = makeWorkspaceUser();
      const after = new Date();
      expect(user.joinedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(user.joinedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should reject missing workspaceId', () => {
      expect(
        WorkspaceUser.create(makeProps({ workspaceId: '' })).isLeft(),
      ).toBe(true);
    });

    it('should reject missing userId', () => {
      expect(WorkspaceUser.create(makeProps({ userId: '' })).isLeft()).toBe(
        true,
      );
    });
  });

  describe('changeRole()', () => {
    it('should update the role', () => {
      const user = makeWorkspaceUser();
      user.changeRole(UserRole.ADMIN);
      expect(user.role).toBe(UserRole.ADMIN);
    });
  });

  describe('markAsDefault() / removeDefault()', () => {
    it('should set isDefault to true then false', () => {
      const user = makeWorkspaceUser();
      user.markAsDefault();
      expect(user.isDefault).toBe(true);
      user.removeDefault();
      expect(user.isDefault).toBe(false);
    });
  });
});
