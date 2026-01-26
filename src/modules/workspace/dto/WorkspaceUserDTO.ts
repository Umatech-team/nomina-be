import { MemberRole } from '@constants/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsString } from 'class-validator';

export class WorkspaceUserDTO {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  workspaceId!: string;

  @ApiProperty()
  @IsString()
  userId!: string;

  @ApiProperty({ enum: MemberRole })
  @IsEnum(MemberRole)
  role!: MemberRole;

  @ApiProperty()
  @IsDate()
  joinedAt!: Date;
}
