import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { UpdateCategoryDTO } from '@modules/category/dto/UpdateCategoryDTO';
import { Body, Controller, HttpCode, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { UpdateCategoryGateway } from '../gateways/UpdateCategory.gateway';
import { CategoryPresenter } from '../presenters/Category.presenter';
import { UpdateCategoryService } from '../services/UpdateCategory.service';

@ApiTags('Category')
@Controller('category')
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class UpdateCategoryController {
  constructor(private readonly updateCategoryService: UpdateCategoryService) {}

  @Put(':id')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { workspaceId, sub }: TokenPayloadSchema,
    @Param('id') id: string,
    @Body(UpdateCategoryGateway) body: UpdateCategoryDTO,
  ) {
    const result = await this.updateCategoryService.execute({
      ...body,
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
