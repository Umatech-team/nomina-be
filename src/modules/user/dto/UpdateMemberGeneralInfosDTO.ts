import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateUserGeneralInfosDTO {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  email!: string;

  @ApiProperty()
  @IsString()
  phone!: string | null;
}
