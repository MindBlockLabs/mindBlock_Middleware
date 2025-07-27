import { Controller, Post, Get, Query, Logger } from '@nestjs/common';
import { TaskCleanupService } from './task-cleanup.service';

@Controller('task-cleanup')
export class TaskCleanupController {
  private readonly logger = new Logger(TaskCleanupController.name);

  constructor(private readonly taskCleanupService: TaskCleanupService) {}

  @Post('manual')
  async manualCleanup(@Query('daysOld') daysOld?: string) {
    this.logger.log(`Manual cleanup requested with daysOld: ${daysOld || 7}`);
    
    const days = daysOld ? parseInt(daysOld, 10) : 7;
    
    if (isNaN(days) || days < 1) {
      throw new Error('daysOld must be a positive number');
    }

    return this.taskCleanupService.manualCleanup(days);
  }

  @Get('stats')
  async getCleanupStats(@Query('daysOld') daysOld?: string) {
    const days = daysOld ? parseInt(daysOld, 10) : 7;
    
    if (isNaN(days) || days < 1) {
      throw new Error('daysOld must be a positive number');
    }

    return this.taskCleanupService.getCleanupStats(days);
  }
} 