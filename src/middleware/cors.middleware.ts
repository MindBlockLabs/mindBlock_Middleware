import { Injectable, type NestMiddleware } from "@nestjs/common"
import type { Request, Response, NextFunction } from "express"

export interface CorsOptions {
  origin?: string | string[] | boolean
  methods?: string[]
  allowedHeaders?: string[]
  credentials?: boolean
}

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  constructor(private readonly options: CorsOptions = {}) {}

  use(req: Request, res: Response, next: NextFunction) {
    const {
      origin = "*",
      methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders = ["Content-Type", "Authorization"],
      credentials = false,
    } = this.options

    // Set CORS headers
    if (typeof origin === "string") {
      res.header("Access-Control-Allow-Origin", origin)
    } else if (Array.isArray(origin)) {
      const requestOrigin = req.headers.origin
      if (requestOrigin && origin.includes(requestOrigin)) {
        res.header("Access-Control-Allow-Origin", requestOrigin)
      }
    } else if (origin === true) {
      res.header("Access-Control-Allow-Origin", req.headers.origin || "*")
    }

    res.header("Access-Control-Allow-Methods", methods.join(", "))
    res.header("Access-Control-Allow-Headers", allowedHeaders.join(", "))

    if (credentials) {
      res.header("Access-Control-Allow-Credentials", "true")
    }

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.status(200).end()
      return
    }

    next()
  }
}
