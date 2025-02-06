import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateMemberPasswordDTO {
  @ApiProperty()
  @IsString()
  email!: string;

  @ApiProperty()
  @IsString()
  currentPassword!: string;

  @ApiProperty()
  @IsString()
  newPassword!: string;
}
