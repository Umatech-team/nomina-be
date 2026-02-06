import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { FinancialPositionPresenter } from '../presenters/FinancialPositionPresenter';
import { GetFinancialPositionService } from '../services/GetFinancialPosition.service';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { statusCode } from '@shared/core/types/statusCode';

@ApiTags('Report')
@Controller('report')
export class GetFinancialPositionController {
  constructor(
    private readonly getFinancialPositionService: GetFinancialPositionService,
  ) {}

  @Get('financial-position')
  @HttpCode(statusCode.OK)
  async handle(@CurrentLoggedUser() { sub }: TokenPayloadSchema) {
    const result = await this.getFinancialPositionService.execute({
      sub,
    });

    return {
      data: FinancialPositionPresenter.toHTTP(result),
    };
  }
}
