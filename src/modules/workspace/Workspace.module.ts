import { DatabaseModule } from '@infra/databases/Database.module';
import { Module } from '@nestjs/common';
import { CryptographyModule } from '@providers/cryptography/Cryptography.module';
import { DateModule } from '@providers/date/Date.module';
import { SubscriptionModule } from '../subscription/Subscription.module';
import { UserModule } from '../user/User.module';
import { AcceptWorkspaceInviteController } from './features/accept-workspace-invite/accept-workspace-invite.controller';
import { AcceptWorkspaceInviteHandler } from './features/accept-workspace-invite/accept-workspace-invite.handler';
import { AddUserToWorkspaceController } from './features/add-user-to-workspace/add-user-to-workspace.controller';
import { AddUserToWorkspaceHandler } from './features/add-user-to-workspace/add-user-to-workspace.handler';
import { CreateWorkspaceInviteController } from './features/create-workspace-invite/create-workspace-invite.controller';
import { CreateWorkspaceInviteHandler } from './features/create-workspace-invite/create-workspace-invite.handler';
import { CreateWorkspaceController } from './features/create-workspace/create-workspace.controller';
import { CreateWorkspaceHandler } from './features/create-workspace/create-workspace.handler';
import { DeleteWorkspaceController } from './features/delete-workspace/delete-workspace.controller';
import { DeleteWorkspaceHandler } from './features/delete-workspace/delete-workspace.handler';
import { FindWorkspaceController } from './features/find-workspace/find-workspace.controller';
import { FindWorkspaceByIdHandler } from './features/find-workspace/find-workspace.handler';
import { ListUsersFromWorkspaceController } from './features/list-user-from-workspace/list-user-from-workspace.controller';
import { ListUsersFromWorkspaceHandler } from './features/list-user-from-workspace/list-user-from-workspace.handler';
import { ListWorkspacesController } from './features/list-workspaces/list-workspaces.controller';
import { ListWorkspacesHandler } from './features/list-workspaces/list-workspaces.handler';
import { RemoveUserFromWorkspaceController } from './features/remove-user-from-workspace/remove-user-from-workspace.controller';
import { RemoveUserFromWorkspaceHandler } from './features/remove-user-from-workspace/remove-user-from-workspace.handler';
import { SwitchWorkspaceController } from './features/switch-workspace/switch-workspace.controller';
import { SwitchWorkspaceHandler } from './features/switch-workspace/switch-workspace.handler';
import { UpdateWorkspaceUserController } from './features/update-workspace-user/update-workspace-user.controller';
import { UpdateWorkspaceUserHandler } from './features/update-workspace-user/update-workspace-user.handler';
import { UpdateWorkspaceController } from './features/update-workspace/update-workspace.controller';
import { UpdateWorkspaceHandler } from './features/update-workspace/update-workspace.handler';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    SubscriptionModule,
    CryptographyModule,
    DateModule,
  ],
  controllers: [
    CreateWorkspaceController,
    UpdateWorkspaceController,
    DeleteWorkspaceController,
    FindWorkspaceController,
    ListWorkspacesController,
    AddUserToWorkspaceController,
    RemoveUserFromWorkspaceController,
    UpdateWorkspaceUserController,
    ListUsersFromWorkspaceController,
    SwitchWorkspaceController,
    CreateWorkspaceInviteController,
    AcceptWorkspaceInviteController,
  ],
  providers: [
    CreateWorkspaceHandler,
    UpdateWorkspaceHandler,
    DeleteWorkspaceHandler,
    FindWorkspaceByIdHandler,
    ListWorkspacesHandler,
    AddUserToWorkspaceHandler,
    RemoveUserFromWorkspaceHandler,
    UpdateWorkspaceUserHandler,
    ListUsersFromWorkspaceHandler,
    SwitchWorkspaceHandler,
    CreateWorkspaceInviteHandler,
    AcceptWorkspaceInviteHandler,
  ],
  exports: [FindWorkspaceByIdHandler, ListWorkspacesHandler],
})
export class WorkspaceModule {}
