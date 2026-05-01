import { Workspace } from './Workspace';

describe('Workspace entity', () => {
  function makeProps(
    overrides: Partial<Parameters<typeof Workspace.create>[0]> = {},
  ) {
    return {
      name: 'My Workspace',
      ...overrides,
    };
  }

  describe('create()', () => {
    it('should create a valid workspace', () => {
      expect(Workspace.create(makeProps()).isRight()).toBe(true);
    });

    it('should default currency to BRL', () => {
      const result = Workspace.create(makeProps());
      if (result.isLeft()) throw result.value;
      expect(result.value.currency).toBe('BRL');
    });

    it.each([
      ['', 'empty name'],
      ['A', 'single char name'],
      ['   ', 'whitespace-only'],
    ])('should reject name "%s" (%s)', (name) => {
      expect(Workspace.create(makeProps({ name })).isLeft()).toBe(true);
    });

    it('should accept name with exactly 2 characters', () => {
      expect(Workspace.create(makeProps({ name: 'AB' })).isRight()).toBe(true);
    });
  });

  describe('updateDetails()', () => {
    function makeWorkspace() {
      const result = Workspace.create(makeProps());
      if (result.isLeft()) throw result.value;
      return result.value;
    }

    it('should update name, currency and timezone', () => {
      const ws = makeWorkspace();
      ws.updateDetails('New Name', 'USD', 'America/New_York');
      expect(ws.name).toBe('New Name');
      expect(ws.currency).toBe('USD');
      expect(ws.timezone).toBe('America/New_York');
    });

    it('should reject name shorter than 2 chars', () => {
      const ws = makeWorkspace();
      expect(ws.updateDetails('A', 'BRL', 'America/Sao_Paulo').isLeft()).toBe(
        true,
      );
    });
  });
});
