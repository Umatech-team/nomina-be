import { SubscriptionStatus } from '@constants/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsString } from 'class-validator';

export class SubscriptionDTO {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  userId!: string;

  @ApiProperty()
  @IsString()
  planId!: string;

  @ApiProperty({ enum: SubscriptionStatus })
  @IsEnum(SubscriptionStatus)
  status!: SubscriptionStatus;

  @ApiProperty()
  @IsDate()
  currentPeriodEnd!: Date;
}
