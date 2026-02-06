import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString } from 'class-validator';

export class RefreshTokenDTO {
  @ApiProperty()
  @IsDate()
  createdAt!: Date;

  @ApiProperty()
  @IsString()
  token!: string;

  @ApiProperty()
  @IsDate()
  expiresIn!: Date;

  @ApiProperty()
  @IsString()
  userId!: string;
}
