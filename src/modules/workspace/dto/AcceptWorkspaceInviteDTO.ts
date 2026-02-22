import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AcceptWorkspaceInviteDTO {
  @ApiProperty()
  @IsString()
  code!: string;
}
