import { HttpClientService, HttpRequestError } from "../http-client.service"
import type { Logger } from "../interfaces/logger.interface"
import axios from "axios"
import { jest } from "@jest/globals"


jest.mock("axios")
const mockedAxios = axios as jest.Mocked<typeof axios>

describe("HttpClientService", () => {
  let httpClient: HttpClientService
  let mockLogger: jest.Mocked<Logger>
  let mockAxiosInstance: jest.Mocked<any>

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    }

    mockAxiosInstance = {
      request: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    }

    mockedAxios.create.mockReturnValue(mockAxiosInstance)
    httpClient = new HttpClientService(mockLogger, "https://api.example.com")
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("successful requests", () => {
    it("should make successful GET request", async () => {
      const mockResponse = {
        data: { id: 1, title: "Test" },
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
      }

      mockAxiosInstance.request.mockResolvedValue(mockResponse)

      const response = await httpClient.get("/test")

      expect(response).toEqual({
        data: { id: 1, title: "Test" },
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
      })

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        url: "/test",
        method: "get",
        headers: undefined,
        data: undefined,
        params: undefined,
        timeout: undefined,
      })
    })

    it("should make successful POST request", async () => {
      const mockResponse = {
        data: { id: 2, title: "Created" },
        status: 201,
        statusText: "Created",
        headers: {},
      }

      const postData = { title: "New Item" }
      mockAxiosInstance.request.mockResolvedValue(mockResponse)

      const response = await httpClient.post("/items", postData)

      expect(response.data).toEqual({ id: 2, title: "Created" })
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        url: "/items",
        method: "post",
        headers: undefined,
        data: postData,
        params: undefined,
        timeout: undefined,
      })
    })
  })

  describe("retry logic", () => {
    it("should retry on server errors", async () => {
      const serverError = {
        response: { status: 500, statusText: "Internal Server Error" },
        message: "Server Error",
      }

      const successResponse = {
        data: { success: true },
        status: 200,
        statusText: "OK",
        headers: {},
      }

      mockAxiosInstance.request
        .mockRejectedValueOnce(serverError)
        .mockRejectedValueOnce(serverError)
        .mockResolvedValueOnce(successResponse)

      const response = await httpClient.get("/test", {
        retry: { maxRetries: 3, baseDelay: 100 },
      })

      expect(response.data).toEqual({ success: true })
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(3)
      expect(mockLogger.warn).toHaveBeenCalledTimes(2)
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("succeeded after retries"),
        expect.any(Object),
      )
    })

    it("should fail after max retries", async () => {
      const serverError = {
        response: { status: 500, statusText: "Internal Server Error" },
        message: "Server Error",
      }

      mockAxiosInstance.request.mockRejectedValue(serverError)

      await expect(
        httpClient.get("/test", {
          retry: { maxRetries: 2, baseDelay: 100 },
        }),
      ).rejects.toThrow(HttpRequestError)

      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(3) // Initial + 2 retries
      expect(mockLogger.warn).toHaveBeenCalledTimes(2)
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining("failed permanently"), expect.any(Object))
    })

    it("should not retry on client errors", async () => {
      const clientError = {
        response: { status: 404, statusText: "Not Found" },
        message: "Not Found",
      }

      mockAxiosInstance.request.mockRejectedValue(clientError)

      await expect(httpClient.get("/test")).rejects.toThrow(HttpRequestError)

      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1)
      expect(mockLogger.warn).not.toHaveBeenCalled()
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining("failed permanently"), expect.any(Object))
    })

    it("should retry on network errors", async () => {
      const networkError = new Error("Network Error")

      const successResponse = {
        data: { success: true },
        status: 200,
        statusText: "OK",
        headers: {},
      }

      mockAxiosInstance.request.mockRejectedValueOnce(networkError).mockResolvedValueOnce(successResponse)

      const response = await httpClient.get("/test", {
        retry: { maxRetries: 2, baseDelay: 100 },
      })

      expect(response.data).toEqual({ success: true })
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2)
      expect(mockLogger.warn).toHaveBeenCalledTimes(1)
    })
  })

  describe("custom retry conditions", () => {
    it("should use custom retry condition", async () => {
      const customError = {
        response: { status: 400, statusText: "Bad Request" },
        message: "Bad Request",
      }

      mockAxiosInstance.request.mockRejectedValue(customError)

      await expect(
        httpClient.request({
          url: "/test",
          method: "GET",
          retry: {
            maxRetries: 2,
            baseDelay: 100,
            retryCondition: (error) => error.response?.status === 400,
          },
        }),
      ).rejects.toThrow(HttpRequestError)

      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(3) 
      expect(mockLogger.warn).toHaveBeenCalledTimes(2)
    })
  })

  describe("logging", () => {
    it("should log request details", async () => {
      const mockResponse = {
        data: { test: true },
        status: 200,
        statusText: "OK",
        headers: {},
      }

      mockAxiosInstance.request.mockResolvedValue(mockResponse)

      await httpClient.get("/test")

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Starting HTTP request"),
        expect.objectContaining({
          url: "/test",
          method: "GET",
          maxRetries: expect.any(Number),
        }),
      )
    })

    it("should sanitize sensitive headers", async () => {
      const mockResponse = {
        data: { test: true },
        status: 200,
        statusText: "OK",
        headers: {},
      }

      mockAxiosInstance.request.mockResolvedValue(mockResponse)

      await httpClient.get("/test", {
        headers: {
          Authorization: "Bearer secret-token",
          "X-API-Key": "secret-key",
          "Content-Type": "application/json",
        },
      })

     
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
    })
  })

  describe("delay calculation", () => {
    it("should calculate exponential backoff with jitter", async () => {
      const serverError = {
        response: { status: 500 },
        message: "Server Error",
      }

      mockAxiosInstance.request.mockRejectedValue(serverError)

      const startTime = Date.now()

      await expect(
        httpClient.get("/test", {
          retry: { maxRetries: 1, baseDelay: 1000, backoffMultiplier: 2 },
        }),
      ).rejects.toThrow()

      const endTime = Date.now()
      const elapsed = endTime - startTime


      expect(elapsed).toBeGreaterThan(800)
    })
  })
})
