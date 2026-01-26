import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { WorkspaceDTO } from './WorkspaceDTO';

export class UpdateWorkspaceDTO extends OmitType(WorkspaceDTO, [
  'id',
  'createdAt',
  'ownerId',
]) {
  @ApiProperty()
  @IsString()
  workspaceId!: string;
}
