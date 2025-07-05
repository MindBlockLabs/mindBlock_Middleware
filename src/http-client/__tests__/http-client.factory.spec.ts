import { HttpClientFactory } from "../http-client.factory"
import { HttpClientService } from "../http-client.service"
import { ConsoleLoggerService } from "../logger/console-logger.service"
import { WinstonLoggerService } from "../logger/winston-logger.service"
import { jest } from "@jest/globals"


jest.mock("../logger/console-logger.service")
jest.mock("../logger/winston-logger.service")
jest.mock("axios")

describe("HttpClientFactory", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("createWithConsoleLogger", () => {
    it("should create HttpClientService with ConsoleLogger", () => {
      const client = HttpClientFactory.createWithConsoleLogger("https://api.example.com")

      expect(client).toBeInstanceOf(HttpClientService)
      expect(ConsoleLoggerService).toHaveBeenCalled()
    })

    it("should create HttpClientService without baseURL", () => {
      const client = HttpClientFactory.createWithConsoleLogger()

      expect(client).toBeInstanceOf(HttpClientService)
      expect(ConsoleLoggerService).toHaveBeenCalled()
    })
  })

  describe("createWithWinstonLogger", () => {
    it("should create HttpClientService with WinstonLogger", () => {
      const client = HttpClientFactory.createWithWinstonLogger("https://api.example.com")

      expect(client).toBeInstanceOf(HttpClientService)
      expect(WinstonLoggerService).toHaveBeenCalled()
    })
  })

  describe("createWithCustomLogger", () => {
    it("should create HttpClientService with custom logger", () => {
      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }

      const client = HttpClientFactory.createWithCustomLogger(mockLogger, "https://api.example.com")

      expect(client).toBeInstanceOf(HttpClientService)
    })
  })

  describe("createConfiguredClient", () => {
    it("should create HttpClientService with default console logger", () => {
      const client = HttpClientFactory.createConfiguredClient({
        baseURL: "https://api.example.com",
      })

      expect(client).toBeInstanceOf(HttpClientService)
      expect(ConsoleLoggerService).toHaveBeenCalled()
    })

    it("should create HttpClientService with custom configuration", () => {
      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }

      const client = HttpClientFactory.createConfiguredClient({
        logger: mockLogger,
        baseURL: "https://api.example.com",
        defaultRetry: {
          maxRetries: 5,
          baseDelay: 2000,
        },
      })

      expect(client).toBeInstanceOf(HttpClientService)
    })
  })
})
