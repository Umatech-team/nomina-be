import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DeleteUserDTO {
  @ApiProperty()
  @IsNumber()
  id!: number;
}
