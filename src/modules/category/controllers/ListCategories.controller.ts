import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { ListCategoriesDTO } from '@modules/category/dto/ListCategoriesDTO';
import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { ListCategoriesGateway } from '../gateways/ListCategories.gateway';
import { CategoryPresenter } from '../presenters/Category.presenter';
import { ListCategoriesService } from '../services/ListCategories.service';

@ApiTags('Category')
@Controller('category')
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.USER, UserRole.VIEWER)
export class ListCategoriesController {
  constructor(private readonly listCategoriesService: ListCategoriesService) {}

  @Get()
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { workspaceId, sub }: TokenPayloadSchema,
    @Query(ListCategoriesGateway) query: ListCategoriesDTO,
  ) {
    const result = await this.listCategoriesService.execute({
      ...query,
      sub: workspaceId || sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { categories, total } = result.value;

    return {
      categories: categories.map(CategoryPresenter.toHTTP),
      total,
    };
  }
}
