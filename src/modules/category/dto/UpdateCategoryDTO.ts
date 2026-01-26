import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CategoryDTO } from './CategoryDTO';

export class UpdateCategoryDTO extends OmitType(CategoryDTO, [
  'id',
  'workspaceId',
]) {
  @ApiProperty()
  @IsString()
  categoryId!: string;
}
