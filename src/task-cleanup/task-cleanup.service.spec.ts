import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskCleanupService } from './task-cleanup.service';
import { PuzzleSession } from '../puzzle-session/entities/puzzle-session.entity';

describe('TaskCleanupService', () => {
  let service: TaskCleanupService;
  let repository: Repository<PuzzleSession>;

  const mockRepository = {
    delete: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskCleanupService,
        {
          provide: getRepositoryToken(PuzzleSession),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TaskCleanupService>(TaskCleanupService);
    repository = module.get<Repository<PuzzleSession>>(getRepositoryToken(PuzzleSession));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('cleanupOldTasks', () => {
    it('should delete tasks older than 7 days', async () => {
      const mockDeleteResult = { affected: 5 };
      mockRepository.delete.mockResolvedValue(mockDeleteResult);

      const result = await service.cleanupOldTasks();

      expect(mockRepository.delete).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(5);
      expect(result.message).toContain('Successfully deleted 5 old puzzle sessions');
    });

    it('should handle case when no tasks are deleted', async () => {
      const mockDeleteResult = { affected: 0 };
      mockRepository.delete.mockResolvedValue(mockDeleteResult);

      const result = await service.cleanupOldTasks();

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(0);
      expect(result.message).toContain('Successfully deleted 0 old puzzle sessions');
    });
  });

  describe('manualCleanup', () => {
    it('should delete tasks older than specified days', async () => {
      const mockDeleteResult = { affected: 3 };
      mockRepository.delete.mockResolvedValue(mockDeleteResult);

      const result = await service.manualCleanup(14);

      expect(mockRepository.delete).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(3);
    });
  });

  describe('getCleanupStats', () => {
    it('should return correct statistics', async () => {
      mockRepository.count
        .mockResolvedValueOnce(10) // old tasks count
        .mockResolvedValueOnce(100); // total tasks count

      const result = await service.getCleanupStats(7);

      expect(result.oldTasksCount).toBe(10);
      expect(result.totalTasksCount).toBe(100);
      expect(result.percentageOld).toBe('10.00');
    });

    it('should handle zero total tasks', async () => {
      mockRepository.count
        .mockResolvedValueOnce(0) // old tasks count
        .mockResolvedValueOnce(0); // total tasks count

      const result = await service.getCleanupStats(7);

      expect(result.oldTasksCount).toBe(0);
      expect(result.totalTasksCount).toBe(0);
      expect(result.percentageOld).toBe('0');
    });
  });
}); 