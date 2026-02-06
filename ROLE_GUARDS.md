# Sistema de Role Guards

Sistema de controle de acesso baseado em roles (RBAC) implementado seguindo os padrões DDD do projeto.

## Estrutura Implementada

### 1. Enum UserRole

Localização: [`src/constants/enums.ts`](src/constants/enums.ts)

```typescript
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}
```

### 2. Decorator @Roles()

Localização: [`src/providers/auth/decorators/Roles.decorator.ts`](src/providers/auth/decorators/Roles.decorator.ts)

Use este decorator nos controllers para proteger endpoints:

```typescript
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { UserRole } from '@constants/enums';

@Roles(UserRole.ADMIN)
@Delete('user/:id')
async deleteUser() {
  // Apenas admins podem acessar
}

@Roles(UserRole.ADMIN, UserRole.USER)
@Get('dashboard')
async dashboard() {
  // Admins OU users podem acessar
}
```

### 3. RolesGuard

Localização: [`src/providers/auth/guards/Roles.guard.ts`](src/providers/auth/guards/Roles.guard.ts)

Guard registrado globalmente que valida roles **após** o `JwtAuthGuard`.

## Fluxo de Autenticação

```
Request
  ↓
1. JwtAuthGuard (verifica se está autenticado)
  ↓
2. RolesGuard (verifica se tem role necessário)
  ↓
3. Controller Handler
```

## Como Usar

### Em Controllers

```typescript
import { Controller, Get, Post } from '@nestjs/common';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { UserRole } from '@constants/enums';

@Controller('admin')
export class AdminController {

  // Apenas admins
  @Roles(UserRole.ADMIN)
  @Post('create-moderator')
  async createModerator() { ... }

  // Rota pública (sem decorator)
  @Get('status')
  async status() { ... }
}
```

### Acessando Role no Controller

Use o decorator `@CurrentLoggedUser()` para acessar o usuário logado com role:

```typescript
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';

@Get('profile')
async getProfile(@CurrentLoggedUser() { sub, role }: TokenPayloadSchema) {
  console.log('User ID:', sub);
  console.log('User Role:', role);
  // role agora está disponível no payload JWT
}
```

## Banco de Dados

O campo `role` foi adicionado à tabela `User`:

- **Tipo**: Enum `UserRole`
- **Padrão**: `USER`
- **Obrigatório**: Sim

Todos os novos users criados terão automaticamente role `USER`.

## Comportamento de Erros

- Se um usuário **não autenticado** tentar acessar rota protegida → `401 Unauthorized` (JwtAuthGuard)
- Se um usuário **sem role adequado** tentar acessar → `403 Forbidden` (RolesGuard)
- Rotas sem decorator `@Roles()` → Acessíveis por qualquer usuário autenticado

## Integração com Sistema Existente

✅ Compatível com decorator `@Public()` - rotas públicas não passam pelos guards  
✅ JWT payload expandido com campo `role`  
✅ Serviços `LoginUserService` e `RefreshTokenService` já incluem role no token  
✅ Entidade `User` possui getter/setter de `role`  
✅ `UserDTO` atualizado com campo `role`

## Próximos Passos (Futuro)

- Adicionar mais roles conforme necessário (ex: `MODERATOR`, `PREMIUM_USER`)
- Implementar permissões granulares se necessário
- Criar endpoints administrativos para gerenciar roles
- Adicionar testes para RolesGuard
