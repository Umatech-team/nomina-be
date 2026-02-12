import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@providers/auth/decorators/IsPublic.decorator';
import { statusCode } from '@shared/core/types/statusCode';
import {
    ProcessWebhookService,
    WebhookPayload,
} from '../services/ProcessWebhook.service';

@ApiTags('Webhook')
@Controller('webhook')
export class WebhookController {
  constructor(private readonly processWebhookService: ProcessWebhookService) {}

  @Post('subscription')
  @Public() // Sem autenticação JWT
  @HttpCode(statusCode.OK)
  @ApiOperation({ summary: 'Webhook endpoint for payment gateway' })
  async handle(
    @Body() payload: WebhookPayload,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Headers('x-webhook-signature') _signature: string,
  ) {
    // TODO: Verificar assinatura do webhook (segurança)
    // const isValid = this.verifySignature(payload, signature);
    // if (!isValid) throw new UnauthorizedException('Invalid signature');

    await this.processWebhookService.execute(payload);

    return { received: true };
  }

  // Implementar verificação de assinatura específica do gateway
  // private verifySignature(payload: WebhookPayload, signature: string): boolean {
  //   // Stripe: usar stripe.webhooks.constructEvent
  //   // Asaas: verificar header X-Asaas-Signature
  //   return true;
  // }
}
