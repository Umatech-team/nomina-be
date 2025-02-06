import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';

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
  @IsNumber()
  memberId!: number;
}
