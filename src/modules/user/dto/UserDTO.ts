import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString } from 'class-validator';

export class UserDTO {
  @ApiProperty()
  @IsString()
  email!: string;

  @ApiProperty()
  @IsString()
  passwordHash!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  phone!: string | null;

  @ApiProperty()
  @IsString()
  avatarUrl!: string | null;

  @ApiProperty()
  @IsDate()
  createdAt!: Date;

  @ApiProperty()
  @IsDate()
  updatedAt!: Date | null;
}
