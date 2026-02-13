import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SwitchWorkspaceDTO {
  @ApiProperty({
    description: 'ID do workspace para o qual deseja trocar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'workspaceId deve ser um UUID válido' })
  workspaceId!: string;
}
