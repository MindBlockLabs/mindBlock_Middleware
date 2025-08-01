import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { UserContext } from './types/user-context.interface';

@Injectable()
export class AuthService {
  private readonly authBackendUrl: string;
  private readonly authHeaderKey: string;
  private readonly sessionCacheTtl: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.authBackendUrl = this.configService.get<string>('AUTH_BACKEND_URL');
    this.authHeaderKey = this.configService.get<string>('AUTH_HEADER_KEY');
    this.sessionCacheTtl = +this.configService.get<number>('SESSION_CACHE_TTL');
  }

  async validateToken(token: string): Promise<UserContext> {
    const cachedUser = await this.cacheManager.get<UserContext>(token);
    if (cachedUser) {
      return cachedUser;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<UserContext>(
          this.authBackendUrl,
          {},
          { headers: { [this.authHeaderKey]: `Bearer ${token}` } },
        ),
      );

      const user = response.data;

      await this.cacheManager.set(token, user, this.sessionCacheTtl * 1000);

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }
}
