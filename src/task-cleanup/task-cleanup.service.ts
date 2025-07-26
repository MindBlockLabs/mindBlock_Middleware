import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { PuzzleSession } from '../puzzle-session/entities/puzzle-session.entity';

@Injectable()
export class TaskCleanupService {
  private readonly logger = new Logger(TaskCleanupService.name);

  constructor(
    @InjectRepository(PuzzleSession)
    private puzzleSessionRepository: Repository<PuzzleSession>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldTasks() {
    this.logger.log('Starting scheduled task cleanup...');
    
    try {
      // Calculate the cutoff date (7 days ago)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7);

      // Find and delete tasks older than 7 days
      const deleteResult = await this.puzzleSessionRepository.delete({
        createdAt: LessThan(cutoffDate),
      });

      const deletedCount = deleteResult.affected || 0;
      
      this.logger.log(`Task cleanup completed. Deleted ${deletedCount} old puzzle sessions older than 7 days.`);
      
      return {
        success: true,
        deletedCount,
        cutoffDate: cutoffDate.toISOString(),
        message: `Successfully deleted ${deletedCount} old puzzle sessions`,
      };
    } catch (error) {
      this.logger.error('Error during task cleanup:', error);
      throw error;
    }
  }

  // Manual cleanup method for testing or on-demand cleanup
  async manualCleanup(daysOld: number = 7) {
    this.logger.log(`Starting manual cleanup for tasks older than ${daysOld} days...`);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const deleteResult = await this.puzzleSessionRepository.delete({
      createdAt: LessThan(cutoffDate),
    });

    const deletedCount = deleteResult.affected || 0;
    
    this.logger.log(`Manual cleanup completed. Deleted ${deletedCount} old puzzle sessions.`);
    
    return {
      success: true,
      deletedCount,
      cutoffDate: cutoffDate.toISOString(),
      message: `Successfully deleted ${deletedCount} old puzzle sessions`,
    };
  }

  // Get statistics about old tasks
  async getCleanupStats(daysOld: number = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldTasksCount = await this.puzzleSessionRepository.count({
      where: {
        createdAt: LessThan(cutoffDate),
      },
    });

    const totalTasksCount = await this.puzzleSessionRepository.count();

    return {
      oldTasksCount,
      totalTasksCount,
      cutoffDate: cutoffDate.toISOString(),
      percentageOld: totalTasksCount > 0 ? ((oldTasksCount / totalTasksCount) * 100).toFixed(2) : '0',
    };
  }
} 