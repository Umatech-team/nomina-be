import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUserDTO {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  password!: string;
}
