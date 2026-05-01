import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { MonthSummaryPresenter } from '@modules/report/presenters/MonthlySummary.presenter';
import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { FindMonthSummaryService } from './get-month-summary.service';

@ApiTags('Report')
@Controller('report')
export class FindMonthSummaryController {
  constructor(private readonly service: FindMonthSummaryService) {}

  @Get('month-summary')
  @HttpCode(statusCode.OK)
  async handle(@CurrentLoggedUser() { sub, workspaceId }: TokenPayloadSchema) {
    const data = await this.service.execute({
      sub,
      workspaceId,
    });

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return MonthSummaryPresenter.toHTTP(data.value);
  }
}
