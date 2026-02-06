import { OmitType } from '@nestjs/swagger';
import { CategoryDTO } from './CategoryDTO';

export class CreateCategoryDTO extends OmitType(CategoryDTO, [
  'id',
  'workspaceId',
]) {}
