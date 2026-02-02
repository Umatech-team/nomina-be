import { DatabaseModule } from '@infra/databases/Database.module';
import { Module } from '@nestjs/common';
import { SubscriptionModule } from '../subscription/Subscription.module';
import { UserModule } from '../user/User.module';
import { AddUserToWorkspaceController } from './controllers/AddUserToWorkspace.controller';
import { CreateWorkspaceController } from './controllers/CreateWorkspace.controller';
import { DeleteWorkspaceController } from './controllers/DeleteWorkspace.controller';
import { FindWorkspaceController } from './controllers/FindWorkspace.controller';
import { ListWorkspacesController } from './controllers/ListWorkspaces.controller';
import { ListWorkspaceUsersController } from './controllers/ListWorkspaceUsers.controller';
import { RemoveUserFromWorkspaceController } from './controllers/RemoveUserFromWorkspace.controller';
import { UpdateWorkspaceController } from './controllers/UpdateWorkspace.controller';
import { UpdateWorkspaceUserController } from './controllers/UpdateWorkspaceUser.controller';
import { AddUserToWorkspaceService } from './services/AddUserToWorkspace.service';
import { CreateWorkspaceService } from './services/CreateWorkspace.service';
import { DeleteWorkspaceService } from './services/DeleteWorkspace.service';
import { FindWorkspaceByIdService } from './services/FindWorkspaceById.service';
import { ListWorkspacesService } from './services/ListWorkspaces.service';
import { ListWorkspaceUsersService } from './services/ListWorkspaceUsers.service';
import { RemoveUserFromWorkspaceService } from './services/RemoveUserFromWorkspace.service';
import { UpdateWorkspaceService } from './services/UpdateWorkspace.service';
import { UpdateWorkspaceUserService } from './services/UpdateWorkspaceUser.service';

@Module({
  imports: [DatabaseModule, UserModule, SubscriptionModule],
  controllers: [
    CreateWorkspaceController,
    UpdateWorkspaceController,
    DeleteWorkspaceController,
    FindWorkspaceController,
    ListWorkspacesController,
    AddUserToWorkspaceController,
    RemoveUserFromWorkspaceController,
    UpdateWorkspaceUserController,
    ListWorkspaceUsersController,
  ],
  providers: [
    CreateWorkspaceService,
    UpdateWorkspaceService,
    DeleteWorkspaceService,
    FindWorkspaceByIdService,
    ListWorkspacesService,
    AddUserToWorkspaceService,
    RemoveUserFromWorkspaceService,
    UpdateWorkspaceUserService,
    ListWorkspaceUsersService,
  ],
  exports: [FindWorkspaceByIdService, ListWorkspacesService],
})
export class WorkspaceModule {}
