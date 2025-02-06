import { PaymentStatus, PlanType, SupportTier } from '@constants/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class MemberDTO {
  @ApiProperty()
  @IsDate()
  createdAt!: Date;

  @ApiProperty()
  @IsDate()
  updatedAt!: Date | null;

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
  password!: string;

  @ApiProperty()
  @IsNumber()
  balance!: number;

  @ApiProperty()
  @IsString()
  plan!: PlanType;

  @ApiProperty()
  @IsDate()
  planStartDate!: Date;

  @ApiProperty()
  @IsDate()
  planEndDate!: Date | null;

  @ApiProperty()
  @IsString()
  paymentStatus!: PaymentStatus;

  @ApiProperty()
  @IsDate()
  renewalDate!: Date | null;

  @ApiProperty()
  @IsString()
  timezone!: string;

  @ApiProperty()
  @IsString()
  language!: string;

  @ApiProperty()
  @IsString()
  currency!: string;

  @ApiProperty()
  @IsString()
  supportTier!: SupportTier;
}
