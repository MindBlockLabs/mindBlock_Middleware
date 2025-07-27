import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ProcessingTaskEntity } from "./entities/task.entity"
import { TaskService } from "./services/task.service"
import { TaskController } from "./controllers/task.controller"
import { TaskRepository } from "./repositories/task.repository"

@Module({
  imports: [TypeOrmModule.forFeature([ProcessingTaskEntity])],
  controllers: [TaskController],
  providers: [TaskService, TaskRepository],
  exports: [TaskService, TaskRepository], // Export for use in other modules
})
export class ProcessingModule {}
