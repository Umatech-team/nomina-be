import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { ExpensesByCategoryDTO } from '../dto/ExpensesByCategoryDTO';
import { GetExpensesByCategoryGateway } from '../gateways/GetExpensesByCategory.gateway';
import { ExpensesByCategoryPresenter } from '../presenters/ExpensesByCategoryPresenter';
import { GetExpensesByCategoryService } from '../services/GetExpensesByCategory.service';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { statusCode } from '@shared/core/types/statusCode';

@ApiTags('Report')
@Controller('report')
export class GetExpensesByCategoryController {
  constructor(
    private readonly getExpensesByCategoryService: GetExpensesByCategoryService,
  ) {}

  @Get('expenses-by-category')
  @HttpCode(statusCode.OK)
  async handle(
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
    @Query(GetExpensesByCategoryGateway) query: ExpensesByCategoryDTO,
  ) {
    const result = await this.getExpensesByCategoryService.execute({
      ...query,
      sub,
    });

    return {
      data: ExpensesByCategoryPresenter.toHTTP(result),
    };
  }
}
