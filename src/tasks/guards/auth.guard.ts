import { Injectable, type CanActivate, type ExecutionContext, UnauthorizedException } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const apiKey = request.headers["x-api-key"]

    if (!apiKey) {
      throw new UnauthorizedException("API key is required")
    }

    const validApiKeys = this.configService.get("VALID_API_KEYS", "").split(",").filter(Boolean)

    if (validApiKeys.length === 0) {
      // If no API keys configured, allow all requests (development mode)
      return true
    }

    if (!validApiKeys.includes(apiKey)) {
      throw new UnauthorizedException("Invalid API key")
    }

    // Add client info to request for logging
    request.client = {
      apiKey: apiKey.substring(0, 8) + "...", // Partial key for logging
      authenticated: true,
    }

    return true
  }
}
