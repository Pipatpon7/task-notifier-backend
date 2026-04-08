import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TaskService } from './task.service';

class CreateTaskDto {
  title!: string;
  description!: string;
  dueDate!: Date;
  notifyBefore!: number;
}
class UpdateTaskDto {
  title?: string;
  description?: string;
  dueDate?: Date;
  notifyBefore?: number;
}

@UseGuards(JwtAuthGuard)
@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get()
  getTasks(@Request() req: any) {
    return this.taskService.getTasks(req.user.userId);
  }

  @Post()
  createTask(@Request() req: any, @Body() body: CreateTaskDto) {
    return this.taskService.createTask(
      req.user.userId,
      body.title,
      body.description,
      body.dueDate,
      body.notifyBefore,
    );
  }

  @Patch(':id')
  updateTask(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
  ) {
    return this.taskService.updateTask(Number(id), req.user.userId, body);
  }

  @Delete(':id')
  deleteTask(@Request() req: any, @Param('id') id: string) {
    return this.taskService.deleteTask(Number(id), req.user.userId);
  }
}
