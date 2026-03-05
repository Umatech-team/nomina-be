import { Entity } from './Entity';

class TestEntity extends Entity<{ name: string; value: number }> {
  constructor(props: { name: string; value: number }, id?: string) {
    super(props, id);
  }

  get name() {
    return this.props.name;
  }

  get value() {
    return this.props.value;
  }
}

describe('Entity', () => {
  describe('Constructor', () => {
    it('should create entity with properties and without id', () => {
      const props = { name: 'Test', value: 42 };
      const entity = new TestEntity(props);

      expect(entity.name).toBe('Test');
      expect(entity.value).toBe(42);
      expect(entity.id).toBeUndefined();
    });

    it('should create entity with properties and custom id', () => {
      const props = { name: 'Test', value: 42 };
      const customId = 'custom-id-123';
      const entity = new TestEntity(props, customId);

      expect(entity.name).toBe('Test');
      expect(entity.value).toBe(42);
      expect(entity.id).toBe(customId);
    });

    it('should handle empty string as id', () => {
      const props = { name: 'Test', value: 42 };
      const entity = new TestEntity(props, '');

      expect(entity.id).toBe('');
    });
  });

  describe('ID Management', () => {
    it('should get id correctly', () => {
      const entity = new TestEntity({ name: 'Test', value: 42 }, 'test-id');

      expect(entity.id).toBe('test-id');
    });

    it('should set id using setId method', () => {
      const entity = new TestEntity({ name: 'Test', value: 42 });
      const newId = 'new-id-456';

      entity.setId(newId);

      expect(entity.id).toBe(newId);
    });

    it('should allow overwriting existing id', () => {
      const entity = new TestEntity({ name: 'Test', value: 42 }, 'original-id');
      const newId = 'overwritten-id';

      entity.setId(newId);

      expect(entity.id).toBe(newId);
    });

    it('should allow setting empty string as id', () => {
      const entity = new TestEntity({ name: 'Test', value: 42 }, 'original-id');

      entity.setId('');

      expect(entity.id).toBe('');
    });
  });

  describe('equals method', () => {
    it('should return true when comparing same instance', () => {
      const entity = new TestEntity({ name: 'Test', value: 42 }, 'same-id');

      expect(entity.equals(entity)).toBe(true);
    });

    it('should return true when entities have same id', () => {
      const props1 = { name: 'Entity1', value: 1 };
      const props2 = { name: 'Entity2', value: 2 };
      const sameId = 'same-id-123';

      const entity1 = new TestEntity(props1, sameId);
      const entity2 = new TestEntity(props2, sameId);

      expect(entity1.equals(entity2)).toBe(true);
      expect(entity2.equals(entity1)).toBe(true);
    });

    it('should return false when entities have different ids', () => {
      const props = { name: 'Test', value: 42 };
      const entity1 = new TestEntity(props, 'id-1');
      const entity2 = new TestEntity(props, 'id-2');

      expect(entity1.equals(entity2)).toBe(false);
      expect(entity2.equals(entity1)).toBe(false);
    });

    it('should return false when one entity has no id', () => {
      const props = { name: 'Test', value: 42 };
      const entityWithId = new TestEntity(props, 'has-id');
      const entityWithoutId = new TestEntity(props);

      expect(entityWithId.equals(entityWithoutId)).toBe(false);
      expect(entityWithoutId.equals(entityWithId)).toBe(false);
    });

    it('should work with different entity types', () => {
      class AnotherTestEntity extends Entity<{ title: string }> {
        constructor(props: { title: string }, id?: string) {
          super(props, id);
        }
      }

      const entity1 = new TestEntity({ name: 'Test', value: 42 }, 'same-id');
      const entity2 = new AnotherTestEntity({ title: 'Title' }, 'same-id');

      expect(entity1.equals(entity2)).toBe(true);
    });
  });

  describe('Properties Management', () => {
    it('should update properties', () => {
      const props = { name: 'Test', value: 42 };
      const entity = new TestEntity(props);

      props.name = 'Modified';
      props.value = 999;

      expect(entity.name).toBe('Modified');
      expect(entity.value).toBe(999);
    });

    it('should allow property access through getters', () => {
      const entity = new TestEntity({ name: 'TestName', value: 123 });

      expect(entity.name).toBe('TestName');
      expect(entity.value).toBe(123);
    });
  });

  describe('Edge Cases', () => {
    it('should handle id changes after equals comparison', () => {
      const entity1 = new TestEntity(
        { name: 'Test', value: 42 },
        'original-id',
      );
      const entity2 = new TestEntity(
        { name: 'Test', value: 42 },
        'different-id',
      );

      expect(entity1.equals(entity2)).toBe(false);

      entity2.setId('original-id');
      expect(entity1.equals(entity2)).toBe(true);
    });
  });
});
