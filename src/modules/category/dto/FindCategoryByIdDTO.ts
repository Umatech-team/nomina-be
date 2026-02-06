import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FindCategoryByIdDTO {
  @ApiProperty()
  @IsString()
  categoryId!: string;
}
