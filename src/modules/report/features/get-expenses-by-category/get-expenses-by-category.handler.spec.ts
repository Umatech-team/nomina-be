import { DrizzleService } from '@infra/databases/drizzle/drizzle.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GetExpensesByCategoryService } from './get-expenses-by-category.service';

type CategoryRow = {
  categoryId: string | null;
  categoryName: string | null;
  totalAmount: number;
};

const makeRequest = (
  overrides?: Partial<{ workspaceId: string; month: number; year: number }>,
) => ({
  workspaceId: 'workspace-1',
  month: 3,
  year: 2026,
  ...overrides,
});

describe('GetExpensesByCategoryService', () => {
  let service: GetExpensesByCategoryService;
  let drizzle: { db: { select: jest.Mock } };

  beforeEach(async () => {
    drizzle = { db: { select: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetExpensesByCategoryService,
        { provide: DrizzleService, useValue: drizzle },
      ],
    }).compile();

    service = module.get(GetExpensesByCategoryService);
  });

  afterEach(() => jest.clearAllMocks());

  function arrangeSuccessMocks({
    grandTotal = 100000,
    categories = [] as CategoryRow[],
  }: { grandTotal?: number; categories?: CategoryRow[] } = {}) {
    const grandTotalBuilder = {
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue([{ grandTotal }]),
    };

    const categoriesBuilder = {
      from: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(categories),
    };

    drizzle.db.select
      .mockReturnValueOnce(grandTotalBuilder)
      .mockReturnValueOnce(categoriesBuilder);

    return { grandTotalBuilder, categoriesBuilder };
  }

  it('should return categories with amounts converted from cents and percentages relative to grand total', async () => {
    arrangeSuccessMocks({
      grandTotal: 100000,
      categories: [
        { categoryId: 'cat-1', categoryName: 'Food', totalAmount: 50000 },
        { categoryId: 'cat-2', categoryName: 'Transport', totalAmount: 30000 },
        { categoryId: 'cat-3', categoryName: 'Health', totalAmount: 20000 },
      ],
    });

    const result = await service.execute(makeRequest());

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      categoryId: 'cat-1',
      categoryName: 'Food',
      totalAmount: 500,
      percentage: 50,
    });
    expect(result[1]).toEqual({
      categoryId: 'cat-2',
      categoryName: 'Transport',
      totalAmount: 300,
      percentage: 30,
    });
    expect(result[2]).toEqual({
      categoryId: 'cat-3',
      categoryName: 'Health',
      totalAmount: 200,
      percentage: 20,
    });
  });

  it('should limit query to 5 categories', async () => {
    const { categoriesBuilder } = arrangeSuccessMocks({ grandTotal: 100000 });

    await service.execute(makeRequest());

    expect(categoriesBuilder.limit).toHaveBeenCalledWith(5);
  });

  it('should compute percentage relative to grand total, not to the sum of top 5', async () => {
    arrangeSuccessMocks({
      grandTotal: 100000,
      categories: [
        { categoryId: 'cat-1', categoryName: 'Food', totalAmount: 50000 },
        { categoryId: 'cat-2', categoryName: 'Transport', totalAmount: 30000 },
      ],
    });

    const result = await service.execute(makeRequest());

    expect(result[0].percentage).toBe(50);
    expect(result[1].percentage).toBe(30);
    expect(result[0].percentage + result[1].percentage).toBe(80);
  });

  it('should return empty array when there are no expenses', async () => {
    arrangeSuccessMocks({ grandTotal: 0, categories: [] });

    const result = await service.execute(makeRequest());

    expect(result).toEqual([]);
  });

  it('should set percentage to 0 for all categories when grand total is 0', async () => {
    arrangeSuccessMocks({
      grandTotal: 0,
      categories: [
        { categoryId: 'cat-1', categoryName: 'Food', totalAmount: 0 },
      ],
    });

    const result = await service.execute(makeRequest());

    expect(result[0].percentage).toBe(0);
  });

  it('should fallback to "uncategorized" / "Sem Categoria" when category data is null', async () => {
    arrangeSuccessMocks({
      grandTotal: 10000,
      categories: [
        { categoryId: null, categoryName: null, totalAmount: 10000 },
      ],
    });

    const result = await service.execute(makeRequest());

    expect(result[0].categoryId).toBe('uncategorized');
    expect(result[0].categoryName).toBe('Sem Categoria');
  });
});
