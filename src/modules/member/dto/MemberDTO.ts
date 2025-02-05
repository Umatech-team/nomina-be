import { PaymentStatus, PlanType, SupportTier } from '@constants/enums';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class MemberDTO {
  @IsDate()
  createdAt!: Date;

  @IsDate()
  updatedAt!: Date | null;

  @IsString()
  name!: string;

  @IsString()
  email!: string;

  @IsString()
  phone!: string | null;

  @IsString()
  password!: string;

  @IsNumber()
  balance!: number;

  @IsString()
  plan!: PlanType;

  @IsDate()
  planStartDate!: Date;

  @IsDate()
  planEndDate!: Date | null;

  @IsString()
  paymentStatus!: PaymentStatus;

  @IsDate()
  renewalDate!: Date | null;

  @IsString()
  timezone!: string;

  @IsString()
  language!: string;

  @IsString()
  currency!: string;

  @IsString()
  supportTier!: SupportTier;
}
