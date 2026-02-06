import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class ExpensesByCategoryDTO {
  @ApiProperty({ example: 1, minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @ApiProperty({ example: 2026, minimum: 2000, maximum: 2100 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;
}

export interface CategoryReportItem {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  totalAmount: number; // in cents
  percentage: number; // 0-100
}

export type ExpensesByCategoryResponse = CategoryReportItem[];
