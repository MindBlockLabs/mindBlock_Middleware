import { type CallHandler, type ExecutionContext, Injectable, type NestInterceptor } from "@nestjs/common"
import type { Observable } from "rxjs"
import { tap } from "rxjs/operators"

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now()
    const type = context.getType()

    if (type === "http") {
      const request = context.switchToHttp().getRequest()
      console.log(`HTTP Request: ${request.method} ${request.url} - Body:`, request.body)
    } else if (type === "rpc") {
      // For microservices (RPC) context
      const data = context.switchToRpc().getData()
      const pattern = context.switchToRpc().getContext().getPattern()
      console.log(`RPC Request: Pattern: ${pattern} - Data:`, data)
    }

    return next.handle().pipe(
      tap((response) => {
        if (type === "http") {
          console.log(
            `HTTP Response: ${context.switchToHttp().getRequest().url} - Time: ${Date.now() - now}ms - Response:`,
            response,
          )
        } else if (type === "rpc") {
          console.log(
            `RPC Response: Pattern: ${context.switchToRpc().getContext().getPattern()} - Time: ${Date.now() - now}ms - Response:`,
            response,
          )
        }
      }),
    )
  }
}
