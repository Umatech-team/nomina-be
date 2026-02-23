import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FindWorkspaceUserByIdDTO {
  @ApiProperty()
  @IsString()
  userId!: string;
}
