
import { All, Controller, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { GatewayService } from './gateway.service';

@ApiTags('Gateway')
@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @All(':version/*')
  @ApiOperation({ summary: 'Proxy all requests to microservices' })
  @ApiParam({ name: 'version', type: 'string' })
  async proxy(@Req() req: Request, @Res() res: Response) {
    return this.gatewayService.proxyRequest(req, res);
  }
}
