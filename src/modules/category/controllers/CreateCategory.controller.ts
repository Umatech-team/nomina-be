import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { CreateCategoryDTO } from '@modules/category/dto/CreateCategoryDTO';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { CreateCategoryGateway } from '../gateways/CreateCategory.gateway';
import { CategoryPresenter } from '../presenters/Category.presenter';
import { CreateCategoryService } from '../services/CreateCategory.service';

@ApiTags('Category')
@Controller('category')
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class CreateCategoryController {
  constructor(private readonly createCategoryService: CreateCategoryService) {}

  @Post('create')
  @HttpCode(statusCode.CREATED)
  async handle(
    @CurrentLoggedUser() { workspaceId, sub }: TokenPayloadSchema,
    @Body(CreateCategoryGateway) body: CreateCategoryDTO,
  ) {
    const result = await this.createCategoryService.execute({
      ...body,
      sub: workspaceId || sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { category } = result.value;

    return CategoryPresenter.toHTTP(category);
  }
}
