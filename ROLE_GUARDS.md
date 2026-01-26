# Sistema de Role Guards

Sistema de controle de acesso baseado em roles (RBAC) implementado seguindo os padrões DDD do projeto.

## Estrutura Implementada

### 1. Enum MemberRole

Localização: [`src/constants/enums.ts`](src/constants/enums.ts)

```typescript
export enum MemberRole {
  USER = "USER",
  ADMIN = "ADMIN",
}
```

### 2. Decorator @Roles()

Localização: [`src/providers/auth/decorators/Roles.decorator.ts`](src/providers/auth/decorators/Roles.decorator.ts)

Use este decorator nos controllers para proteger endpoints:

```typescript
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { MemberRole } from '@constants/enums';

@Roles(MemberRole.ADMIN)
@Delete('member/:id')
async deleteUser() {
  // Apenas admins podem acessar
}

@Roles(MemberRole.ADMIN, MemberRole.USER)
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
import { MemberRole } from '@constants/enums';

@Controller('admin')
export class AdminController {

  // Apenas admins
  @Roles(MemberRole.ADMIN)
  @Post('create-moderator')
  async createModerator() { ... }

  // Rota pública (sem decorator)
  @Get('status')
  async status() { ... }
}
```

### Acessando Role no Controller

Use o decorator `@CurrentLoggedMember()` para acessar o usuário logado com role:

```typescript
import { CurrentLoggedMember } from '@providers/auth/decorators/CurrentLoggedMember.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';

@Get('profile')
async getProfile(@CurrentLoggedMember() { sub, role }: TokenPayloadSchema) {
  console.log('Member ID:', sub);
  console.log('Member Role:', role);
  // role agora está disponível no payload JWT
}
```

## Banco de Dados

O campo `role` foi adicionado à tabela `Member`:

- **Tipo**: Enum `MemberRole`
- **Padrão**: `USER`
- **Obrigatório**: Sim

Todos os novos members criados terão automaticamente role `USER`.

## Comportamento de Erros

- Se um usuário **não autenticado** tentar acessar rota protegida → `401 Unauthorized` (JwtAuthGuard)
- Se um usuário **sem role adequado** tentar acessar → `403 Forbidden` (RolesGuard)
- Rotas sem decorator `@Roles()` → Acessíveis por qualquer usuário autenticado

## Integração com Sistema Existente

✅ Compatível com decorator `@Public()` - rotas públicas não passam pelos guards  
✅ JWT payload expandido com campo `role`  
✅ Serviços `LoginMemberService` e `RefreshTokenService` já incluem role no token  
✅ Entidade `Member` possui getter/setter de `role`  
✅ `MemberDTO` atualizado com campo `role`

## Próximos Passos (Futuro)

- Adicionar mais roles conforme necessário (ex: `MODERATOR`, `PREMIUM_USER`)
- Implementar permissões granulares se necessário
- Criar endpoints administrativos para gerenciar roles
- Adicionar testes para RolesGuard
