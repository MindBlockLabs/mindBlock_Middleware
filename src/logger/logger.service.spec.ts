import { Test, type TestingModule } from "@nestjs/testing"
import { ConfigService } from "@nestjs/config"
import { CustomLoggerService } from "./logger.service"
import { jest } from "@jest/globals"

describe("CustomLoggerService", () => {
  let service: CustomLoggerService
  let configService: ConfigService

  // Mock console methods
  const mockConsole = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }

  beforeEach(async () => {
    // Replace console methods with mocks
    jest.spyOn(console, "log").mockImplementation(mockConsole.log)
    jest.spyOn(console, "warn").mockImplementation(mockConsole.warn)
    jest.spyOn(console, "error").mockImplementation(mockConsole.error)
    jest.spyOn(console, "debug").mockImplementation(mockConsole.debug)

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomLoggerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: any) => {
              if (key === "ENABLE_DEBUG_LOGS") return false
              if (key === "LOG_LEVEL") return "log"
              return defaultValue
            }),
          },
        },
      ],
    }).compile()

    service = module.get<CustomLoggerService>(CustomLoggerService)
    configService = module.get<ConfigService>(ConfigService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("createLogger", () => {
    it("should create a logger with correct context", () => {
      const logger = service.createLogger("TestService")
      expect(logger).toHaveProperty("info")
      expect(logger).toHaveProperty("warn")
      expect(logger).toHaveProperty("error")
      expect(logger).toHaveProperty("debug")
    })

    it("should log info messages with correct format", () => {
      const logger = service.createLogger("TestService")
      logger.info("Test message")

      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[TestService\] \[INFO\] Test message$/,
        ),
      )
    })

    it("should log warn messages with correct format", () => {
      const logger = service.createLogger("TestService")
      logger.warn("Warning message")

      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[TestService\] \[WARN\] Warning message$/,
        ),
      )
    })

    it("should log error messages with correct format", () => {
      const logger = service.createLogger("TestService")
      const error = new Error("Test error")
      logger.error("Error occurred", error)

      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[TestService\] \[ERROR\] Error occurred - Test error$/,
        ),
      )
    })

    it("should not log debug messages when debug is disabled", () => {
      const logger = service.createLogger("TestService")
      logger.debug("Debug message")

      expect(mockConsole.debug).not.toHaveBeenCalled()
    })

    it("should log debug messages when debug is enabled", async () => {
      // Create a new service instance with debug enabled
      const moduleWithDebug: TestingModule = await Test.createTestingModule({
        providers: [
          CustomLoggerService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string, defaultValue: any) => {
                if (key === "ENABLE_DEBUG_LOGS") return true
                if (key === "LOG_LEVEL") return "log"
                return defaultValue
              }),
            },
          },
        ],
      }).compile()

      const debugService = moduleWithDebug.get<CustomLoggerService>(CustomLoggerService)
      const logger = debugService.createLogger("TestService")
      logger.debug("Debug message")

      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[TestService\] \[DEBUG\] Debug message$/,
        ),
      )
    })
  })
})
