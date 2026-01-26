import { TransactionType } from '@constants/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class CategoryDTO {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  workspaceId!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  icon!: string | null;

  @ApiProperty()
  @IsString()
  color!: string | null;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiProperty()
  @IsString()
  parentId!: string | null;
}
