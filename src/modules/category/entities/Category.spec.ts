import { TransactionType } from '@constants/enums';
import { Category } from './Category';

describe('Category entity', () => {
  function makeProps(
    overrides: Partial<Parameters<typeof Category.create>[0]> = {},
  ) {
    return {
      workspaceId: 'workspace-1',
      name: 'Food',
      type: TransactionType.EXPENSE,
      parentId: null,
      isSystemCategory: false,
      ...overrides,
    };
  }

  describe('create()', () => {
    it('should create a valid category', () => {
      expect(Category.create(makeProps()).isRight()).toBe(true);
    });

    it('should reject empty name', () => {
      expect(Category.create(makeProps({ name: '' })).isLeft()).toBe(true);
    });

    it('should reject empty string parentId', () => {
      expect(Category.create(makeProps({ parentId: '' })).isLeft()).toBe(true);
    });

    it('should reject parentId equal to its own id', () => {
      const id = 'cat-id-1';
      expect(Category.create(makeProps({ parentId: id }), id).isLeft()).toBe(
        true,
      );
    });
  });

  describe('updateName()', () => {
    function makeCategory(overrides = {}) {
      const result = Category.create(makeProps(overrides));
      if (result.isLeft()) throw result.value;
      return result.value;
    }

    it('should update name successfully', () => {
      const cat = makeCategory();
      const result = cat.updateName('Groceries');
      expect(result.isRight()).toBe(true);
      expect(cat.name).toBe('Groceries');
    });

    it('should reject empty name', () => {
      const cat = makeCategory();
      expect(cat.updateName('').isLeft()).toBe(true);
    });

    it('should reject update on system category', () => {
      const cat = makeCategory({ isSystemCategory: true });
      expect(cat.updateName('New Name').isLeft()).toBe(true);
    });
  });

  describe('moveToParent()', () => {
    function makeCategory(id?: string) {
      const result = Category.create(makeProps(), id);
      if (result.isLeft()) throw result.value;
      return result.value;
    }

    it('should move to a valid parent', () => {
      const cat = makeCategory('cat-1');
      expect(cat.moveToParent('parent-1').isRight()).toBe(true);
      expect(cat.parentId).toBe('parent-1');
    });

    it('should allow moving to null (root)', () => {
      const cat = makeCategory('cat-1');
      cat.moveToParent('parent-1');
      expect(cat.moveToParent(null).isRight()).toBe(true);
    });

    it('should reject empty string parentId', () => {
      const cat = makeCategory('cat-1');
      expect(cat.moveToParent('').isLeft()).toBe(true);
    });

    it('should reject self-reference', () => {
      const cat = makeCategory('cat-1');
      expect(cat.moveToParent('cat-1').isLeft()).toBe(true);
    });

    it('should reject on system category', () => {
      const result = Category.create(
        makeProps({ isSystemCategory: true }),
        'sys-1',
      );
      if (result.isLeft()) throw result.value;
      expect(result.value.moveToParent('parent-1').isLeft()).toBe(true);
    });
  });
});
