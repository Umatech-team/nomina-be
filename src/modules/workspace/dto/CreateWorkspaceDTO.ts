import { OmitType } from '@nestjs/swagger';
import { WorkspaceDTO } from './WorkspaceDTO';

export class CreateWorkspaceDTO extends OmitType(WorkspaceDTO, [
  'id',
  'createdAt',
]) {
  isDefault!: boolean;
}
