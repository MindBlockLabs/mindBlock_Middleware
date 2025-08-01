import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);
  private readonly backendUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.backendUrl = this.configService.get<string>('MIND_BLOCK_BACKEND_URL');
  }

  async proxyRequest(req: Request, res: Response): Promise<void> {
    const { method, body, headers } = req;
    const { version, 0: path } = req.params;

    const targetUrl = `${this.backendUrl}/api/${version}/${path}`;

    delete headers.host;

    const startTime = Date.now();

    try {
      this.logger.log(`Proxying [${method}] to ${targetUrl}`);

      const backendResponse = await firstValueFrom(
        this.httpService.request({
          method,
          url: targetUrl,
          data: body,
          headers,

          responseType: 'stream',
        }),
      );

      res.status(backendResponse.status);
      res.set(backendResponse.headers);
      backendResponse.data.pipe(res);

      const duration = Date.now() - startTime;
      this.logger.log(
        `[${method}] ${req.originalUrl} -> ${targetUrl} | ${backendResponse.status} | ${duration}ms`,
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      const statusCode = error.response?.status || 502;
      const errorMessage = `Error proxying to backend: ${error.message}`;

      this.logger.error(
        `[${method}] ${req.originalUrl} -> ${targetUrl} | ${statusCode} | ${duration}ms | ${errorMessage}`,
      );

      if (!res.headersSent) {
        res.status(statusCode).json({
          statusCode: statusCode,
          message: 'An error occurred while proxying the request.',
          error: 'Bad Gateway',
        });
      }
    }
  }
}
