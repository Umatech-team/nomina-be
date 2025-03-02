import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class GoalDTO {
  @ApiProperty()
  @IsDate()
  createdAt!: Date;

  @ApiProperty()
  @IsDate()
  updatedAt!: Date | null;

  @ApiProperty()
  @IsNumber()
  memberId!: number;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsNumber()
  targetAmount!: number;

  @ApiProperty()
  @IsNumber()
  currentAmount!: number;

  @ApiProperty()
  @IsNumber()
  monthlyContribution!: number;
}
