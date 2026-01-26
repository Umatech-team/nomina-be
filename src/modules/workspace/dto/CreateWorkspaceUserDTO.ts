import { OmitType } from '@nestjs/swagger';
import { WorkspaceUserDTO } from './WorkspaceUserDTO';

export class CreateWorkspaceUserDTO extends OmitType(WorkspaceUserDTO, [
  'id',
  'joinedAt',
]) {}
