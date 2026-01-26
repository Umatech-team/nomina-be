import { MemberRole } from '@constants/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class UpdateWorkspaceUserDTO {
  @ApiProperty()
  @IsString()
  workspaceUserId!: string;

  @ApiProperty({ enum: MemberRole })
  @IsEnum(MemberRole)
  role!: MemberRole;
}
