import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { CategoryPresenter } from '@modules/category/presenters/Category.presenter';
import { Controller, Get, HttpCode, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { RolesGuard } from '@providers/auth/guards/Roles.guard';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import {
  ListCategoriesPipe,
  type ListCategoriesRequest,
} from './list-categories.dto';
import { ListCategoriesHandler } from './list-categories.handler';

@ApiTags('Category')
@Controller('category')
@UseGuards(RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.USER, UserRole.VIEWER)
export class ListCategoriesController {
  constructor(private readonly handler: ListCategoriesHandler) {}

  @Get()
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { workspaceId, sub }: TokenPayloadSchema,
    @Query(ListCategoriesPipe) query: ListCategoriesRequest,
  ) {
    const data = await this.handler.execute({
      ...query,
      sub: workspaceId || sub,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return {
      data: {
        categories: data.value.categories.map(CategoryPresenter.toHTTP),
        total: data.value.total,
      },
    };
  }
}
