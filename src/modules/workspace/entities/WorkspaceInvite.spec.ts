import { UserRole } from '@constants/enums';
import { WorkspaceInvite } from './WorkspaceInvite';

describe('WorkspaceInvite entity', () => {
  const FUTURE = new Date(Date.now() + 86_400_000);
  const PAST = new Date(Date.now() - 86_400_000);

  function makeProps(
    overrides: Partial<Parameters<typeof WorkspaceInvite.create>[0]> = {},
  ) {
    return {
      code: 'INVITE123',
      workspaceId: 'ws-1',
      role: UserRole.USER,
      createdBy: 'user-owner',
      expiresAt: FUTURE,
      ...overrides,
    };
  }

  function makeInvite(overrides = {}) {
    const result = WorkspaceInvite.create(makeProps(overrides));
    if (result.isLeft()) throw result.value;
    return result.value;
  }

  describe('create()', () => {
    it('should create a valid invite', () => {
      expect(WorkspaceInvite.create(makeProps()).isRight()).toBe(true);
    });

    it('should reject missing workspaceId', () => {
      expect(
        WorkspaceInvite.create(makeProps({ workspaceId: '' })).isLeft(),
      ).toBe(true);
    });

    it('should reject missing createdBy', () => {
      expect(
        WorkspaceInvite.create(makeProps({ createdBy: '' })).isLeft(),
      ).toBe(true);
    });

    it('should reject past expiresAt for new invites', () => {
      expect(
        WorkspaceInvite.create(makeProps({ expiresAt: PAST })).isLeft(),
      ).toBe(true);
    });

    it('should allow past expiresAt when restoring with an id', () => {
      expect(
        WorkspaceInvite.create(
          makeProps({ expiresAt: PAST }),
          'existing-id',
        ).isRight(),
      ).toBe(true);
    });
  });

  describe('isExpired()', () => {
    it('should return false for a future expiration', () => {
      expect(makeInvite().isExpired(new Date())).toBe(false);
    });

    it('should return true when reference date is after expiration', () => {
      const invite = WorkspaceInvite.create(
        makeProps({ expiresAt: PAST }),
        'id',
      ).value as WorkspaceInvite;
      expect(invite.isExpired(new Date())).toBe(true);
    });
  });

  describe('isUsed', () => {
    it('should be false for a fresh invite', () => {
      expect(makeInvite().isUsed).toBe(false);
    });
  });

  describe('accept()', () => {
    it('should mark invite as used', () => {
      const invite = makeInvite();
      const result = invite.accept('user-2');
      expect(result.isRight()).toBe(true);
      expect(invite.usedBy).toBe('user-2');
      expect(invite.usedAt).toBeInstanceOf(Date);
    });

    it('should reject if already used', () => {
      const invite = makeInvite();
      invite.accept('user-2');
      expect(invite.accept('user-3').isLeft()).toBe(true);
    });

    it('should reject if expired', () => {
      const invite = WorkspaceInvite.create(
        makeProps({ expiresAt: PAST }),
        'id',
      ).value as WorkspaceInvite;
      expect(invite.accept('user-2', new Date()).isLeft()).toBe(true);
    });
  });
});
