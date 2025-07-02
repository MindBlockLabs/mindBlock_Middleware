import { createLogger } from "./create-logger.function"
import jest from "jest"

describe("createLogger function", () => {
  // Mock console methods
  const mockConsole = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }

  beforeEach(() => {
    // Replace console methods with mocks
    jest.spyOn(console, "log").mockImplementation(mockConsole.log)
    jest.spyOn(console, "warn").mockImplementation(mockConsole.warn)
    jest.spyOn(console, "error").mockImplementation(mockConsole.error)
    jest.spyOn(console, "debug").mockImplementation(mockConsole.debug)

    // Mock environment variables
    process.env.ENABLE_DEBUG_LOGS = "false"
  })

  afterEach(() => {
    jest.clearAllMocks()
    delete process.env.ENABLE_DEBUG_LOGS
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it("should create a logger with all required methods", () => {
    const logger = createLogger("TestContext")

    expect(logger).toHaveProperty("info")
    expect(logger).toHaveProperty("warn")
    expect(logger).toHaveProperty("error")
    expect(logger).toHaveProperty("debug")
  })

  it("should format messages correctly", () => {
    const logger = createLogger("TestContext")
    logger.info("Test message")

    expect(mockConsole.log).toHaveBeenCalledWith(
      expect.stringMatching(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[TestContext\] \[INFO\] Test message$/),
    )
  })

  it("should respect debug log toggle", () => {
    const logger = createLogger("TestContext")
    logger.debug("Debug message")

    expect(mockConsole.debug).not.toHaveBeenCalled()
  })

  it("should log debug messages when enabled", () => {
    process.env.ENABLE_DEBUG_LOGS = "true"
    const logger = createLogger("TestContext")
    logger.debug("Debug message")

    expect(mockConsole.debug).toHaveBeenCalledWith(
      expect.stringMatching(
        /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[TestContext\] \[DEBUG\] Debug message$/,
      ),
    )
  })

  it("should handle errors with stack traces", () => {
    const logger = createLogger("TestContext")
    const error = new Error("Test error")
    error.stack = "Error stack trace"

    logger.error("Something went wrong", error)

    expect(mockConsole.error).toHaveBeenCalledTimes(2)
    expect(mockConsole.error).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(
        /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[TestContext\] \[ERROR\] Something went wrong - Test error$/,
      ),
    )
    expect(mockConsole.error).toHaveBeenNthCalledWith(2, "Error stack trace")
  })
})
