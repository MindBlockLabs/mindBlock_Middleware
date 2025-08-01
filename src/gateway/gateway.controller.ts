import { All, Controller, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @All(':version/*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    return this.gatewayService.proxyRequest(req, res);
  }
}
