import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FindAccountByIdDTO {
  @ApiProperty()
  @IsString()
  accountId!: string;
}
