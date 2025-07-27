import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ScheduleModule } from "@nestjs/schedule"
import { TaskEntity } from "./entities/task.entity"
import { TaskWorkerService } from "./task-worker.service"
import { TasksController } from "./tasks.controller"

@Module({
  imports: [
    // Register the TaskEntity with TypeORM
    TypeOrmModule.forFeature([TaskEntity]),
    // Initialize the ScheduleModule for interval-based tasks
    ScheduleModule.forRoot(),
  ],
  controllers: [TasksController], // Expose an endpoint to create tasks
  providers: [TaskWorkerService], // Provide the worker service
  exports: [TaskWorkerService, TypeOrmModule], // Export if other modules need to create tasks or access the repository
})
export class TasksModule {}
