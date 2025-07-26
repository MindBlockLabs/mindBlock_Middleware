import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskCleanupService } from './task-cleanup.service';
import { TaskCleanupController } from './task-cleanup.controller';
import { PuzzleSession } from '../puzzle-session/entities/puzzle-session.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([PuzzleSession]),
  ],
  controllers: [TaskCleanupController],
  providers: [TaskCleanupService],
  exports: [TaskCleanupService],
})
export class TaskCleanupModule {} 