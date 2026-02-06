import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CategoryDTO } from './CategoryDTO';

export class UpdateCategoryDTO extends PartialType(
  OmitType(CategoryDTO, ['id', 'workspaceId']),
) {
  @ApiPropertyOptional()
  @IsString()
  categoryId?: string;
}
