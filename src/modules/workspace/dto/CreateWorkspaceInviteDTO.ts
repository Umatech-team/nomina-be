import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateWorkspaceInviteDTO {
  @ApiProperty()
  @IsString()
  workspaceId!: string;

  @ApiProperty()
  @IsString()
  role!: string;
}
