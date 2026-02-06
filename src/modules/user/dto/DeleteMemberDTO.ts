import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class DeleteUserDTO {
  @ApiProperty()
  @IsNumber()
  id!: number;

  @ApiProperty()
  @IsString()
  email!: string;
}
