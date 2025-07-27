import { Module } from "@nestjs/common"
import { HttpModule } from "@nestjs/axios"
import { ScheduleModule } from "@nestjs/schedule"
import { TaskController } from "./controllers/task.controller"
import { TaskService } from "./services/task.service"
import { TaskWorkerService } from "./services/task-worker.service"
import { TaskQueueService } from "./services/task-queue.service"
import { LoggerService } from "./services/logger.service"
import { AuthGuard } from "./guards/auth.guard"

@Module({
  imports: [HttpModule, ScheduleModule.forRoot()],
  controllers: [TaskController],
  providers: [TaskService, TaskWorkerService, TaskQueueService, LoggerService, AuthGuard],
  exports: [TaskService, LoggerService],
})
export class TasksModule {}
