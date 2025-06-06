import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { ConflictException } from "@nestjs/common"
import { PuzzleSessionService } from "./puzzle-session.service"
import { PuzzleSession } from "../entities/puzzle-session.entity"

describe("PuzzleSessionService", () => {
  let service: PuzzleSessionService
  let repository: Repository<PuzzleSession>

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PuzzleSessionService,
        {
          provide: getRepositoryToken(PuzzleSession),
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<PuzzleSessionService>(PuzzleSessionService)
    repository = module.get<Repository<PuzzleSession>>(getRepositoryToken(PuzzleSession))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("checkSessionCompletion", () => {
    it("should return true if session is already complete", async () => {
      const mockSession = { id: 1, sessionId: "test-session", puzzleId: "puzzle-1", isComplete: true }
      mockRepository.findOne.mockResolvedValue(mockSession)

      const result = await service.checkSessionCompletion("test-session", "puzzle-1")

      expect(result).toBe(true)
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { sessionId: "test-session", puzzleId: "puzzle-1", isComplete: true },
      })
    })

    it("should return false if session is not complete", async () => {
      mockRepository.findOne.mockResolvedValue(null)

      const result = await service.checkSessionCompletion("test-session", "puzzle-1")

      expect(result).toBe(false)
    })
  })

  describe("createOrUpdateSession", () => {
    it("should throw ConflictException if session is already complete", async () => {
      const mockSession = { id: 1, sessionId: "test-session", puzzleId: "puzzle-1", isComplete: true }
      mockRepository.findOne.mockResolvedValue(mockSession)

      await expect(service.createOrUpdateSession("test-session", "puzzle-1", { answer: "test" })).rejects.toThrow(
        ConflictException,
      )
    })

    it("should create new session if none exists", async () => {
      mockRepository.findOne.mockResolvedValue(null)
      const newSession = { id: 1, sessionId: "test-session", puzzleId: "puzzle-1", isComplete: true }
      mockRepository.create.mockReturnValue(newSession)
      mockRepository.save.mockResolvedValue(newSession)

      const result = await service.createOrUpdateSession("test-session", "puzzle-1", { answer: "test" })

      expect(result).toEqual(newSession)
      expect(mockRepository.create).toHaveBeenCalled()
      expect(mockRepository.save).toHaveBeenCalled()
    })
  })
})
