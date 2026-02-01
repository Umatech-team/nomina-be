import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { CategoryPresenter } from '../presenters/Category.presenter';
import { FindCategoryByIdService } from '../services/FindCategoryById.service';

@ApiTags('Category')
@Controller('category')
@Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.USER, UserRole.VIEWER)
export class FindCategoryController {
  constructor(
    private readonly findCategoryByIdService: FindCategoryByIdService,
  ) {}

  @Get(':id')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { workspaceId, sub }: TokenPayloadSchema,
    @Param('id') id: string,
  ) {
    const result = await this.findCategoryByIdService.execute({
      categoryId: id,
      sub: workspaceId || sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { category } = result.value;

    return CategoryPresenter.toHTTP(category);
  }
}
