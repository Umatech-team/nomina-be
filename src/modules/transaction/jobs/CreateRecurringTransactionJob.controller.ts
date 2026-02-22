import {
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiKey } from '@providers/auth/decorators/ApiKey.decorator';
import { Public } from '@providers/auth/decorators/IsPublic.decorator';
import { statusCode } from '@shared/core/types/statusCode';
import { GenerateRecurringTransactionsJobService } from './GenerateRecurringTransactionsJob.service';
@ApiTags('Recurring Transaction')
@Controller('internal')
export class GenerateRecurringTransactionJobController {
  constructor(
    private readonly createService: GenerateRecurringTransactionsJobService,
  ) {}

  @Public()
  @Post('generate-recurring-transactions')
  @HttpCode(statusCode.OK)
  async handle(@ApiKey() apiKey: string) {
    if (apiKey !== process.env.CRON_API_KEY) {
      throw new UnauthorizedException('Chave de CRON inválida ou ausente');
    }
    const result = await this.createService.execute();

    if (result.isLeft()) {
      console.error(
        'Error executing GenerateRecurringTransactionsJobService:',
        result.value,
      );
      return;
    }

    const { generatedCount } = result.value;

    console.log(
      `GenerateRecurringTransactionsJobService completed. Generated ${generatedCount} transactions.`,
    );
  }
}
