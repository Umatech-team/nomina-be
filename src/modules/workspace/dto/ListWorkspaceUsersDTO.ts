import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ListWorkspaceUsersDTO {
  @ApiProperty()
  @IsString()
  workspaceId!: string;

  @ApiProperty()
  @IsNumber()
  page!: number;

  @ApiProperty()
  @IsNumber()
  pageSize!: number;
}
