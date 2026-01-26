import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ListWorkspacesDTO {
  @ApiProperty()
  @IsNumber()
  page!: number;

  @ApiProperty()
  @IsNumber()
  pageSize!: number;
}
