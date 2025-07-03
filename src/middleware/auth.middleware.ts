import { Injectable, type NestMiddleware, UnauthorizedException } from "@nestjs/common"
import type { Request, Response, NextFunction } from "express"
import type { AuthService } from "../interfaces/auth.interface"

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService?: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = this.extractTokenFromHeader(req)

      if (!token) {
        throw new UnauthorizedException("Token not found")
      }

      if (this.authService) {
        const user = await this.authService.validateToken(token)
        req["user"] = user
      }

      next()
    } catch (error) {
      throw new UnauthorizedException("Invalid token")
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? []
    return type === "Bearer" ? token : undefined
  }
}
