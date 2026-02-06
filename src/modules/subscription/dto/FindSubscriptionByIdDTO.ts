import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FindSubscriptionByIdDTO {
  @ApiProperty()
  @IsString()
  subscriptionId!: string;
}
