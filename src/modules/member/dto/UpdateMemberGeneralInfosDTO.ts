import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateMemberGeneralInfosDTO {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  email!: string;

  @ApiProperty()
  @IsString()
  phone!: string | null;

  @ApiProperty()
  @IsString()
  language!: string;

  @ApiProperty()
  @IsString()
  currency!: string;
}
