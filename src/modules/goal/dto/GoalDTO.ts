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
  @IsString()
  category!: string;

  @ApiProperty({ description: 'Valor alvo em centavos' })
  @IsNumber()
  targetAmount!: number; // Agora em centavos

  @ApiProperty({ description: 'Valor atual em centavos' })
  @IsNumber()
  currentAmount!: number; // Agora em centavos

  @ApiProperty({ description: 'Contribuição mensal em centavos' })
  @IsNumber()
  monthlyContribution!: number; // Agora em centavos
}
