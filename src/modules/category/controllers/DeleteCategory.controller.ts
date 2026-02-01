import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { DeleteCategoryService } from '../services/DeleteCategory.service';

@ApiTags('Category')
@Controller('category')
@Roles(UserRole.OWNER)
export class DeleteCategoryController {
  constructor(private readonly deleteCategoryService: DeleteCategoryService) {}

  @Delete(':id')
  @HttpCode(statusCode.NO_CONTENT)
  async handle(
    @CurrentLoggedUser() { workspaceId, sub }: TokenPayloadSchema,
    @Param('id') id: string,
  ) {
    const result = await this.deleteCategoryService.execute({
      categoryId: id,
      sub: workspaceId || sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }
  }
}
