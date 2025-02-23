import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedMember } from '@providers/auth/decorators/CurrentLoggedMember.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { MonthlySummaryPresenter } from '../presenters/MonthlySummary.presenter';
import { FindMonthlySummaryWithPercentageService } from '../services/FindMonthSummary.service';

@ApiTags('Transaction')
@Controller('transaction')
export class FindMonthlySummaryWithPercentageController {
  constructor(
    private readonly findMonthlySummaryWithPercentageService: FindMonthlySummaryWithPercentageService,
  ) {}

  @Get('monthly-summary-with-percentage')
  @HttpCode(statusCode.OK)
  async handle(@CurrentLoggedMember() { sub }: TokenPayloadSchema) {
    const result = await this.findMonthlySummaryWithPercentageService.execute({
      sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { monthSummary } = result.value;

    return MonthlySummaryPresenter.toHTTP(monthSummary);
  }
}
