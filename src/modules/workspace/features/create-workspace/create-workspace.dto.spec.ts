import { z } from 'zod';

const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
  currency: z
    .string()
    .trim()
    .length(3, 'Moeda deve ter 3 caracteres (ex: BRL)')
    .optional(),
  isDefault: z.boolean(),
});

describe('CreateWorkspaceRequest DTO', () => {
  function makeValid(overrides: Record<string, unknown> = {}) {
    return { name: 'My Workspace', isDefault: false, ...overrides };
  }

  it('should accept a valid payload', () => {
    expect(createWorkspaceSchema.safeParse(makeValid()).success).toBe(true);
  });

  it('should accept with optional currency', () => {
    expect(
      createWorkspaceSchema.safeParse(makeValid({ currency: 'USD' })).success,
    ).toBe(true);
  });

  it.each<[Record<string, unknown>, string]>([
    [{ name: '' }, 'empty name'],
    [{ name: 'A'.repeat(101) }, 'name exceeding 100 chars'],
    [{ isDefault: undefined }, 'missing isDefault'],
    [{ currency: 'US' }, 'currency with 2 chars'],
    [{ currency: 'USDD' }, 'currency with 4 chars'],
    [{ currency: '' }, 'empty currency'],
  ])('should reject when %s', (invalidFields) => {
    expect(
      createWorkspaceSchema.safeParse(makeValid(invalidFields)).success,
    ).toBe(false);
  });

  it('should trim whitespace from name', () => {
    const result = createWorkspaceSchema.safeParse(
      makeValid({ name: '  Workspace  ' }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('Workspace');
  });
});
