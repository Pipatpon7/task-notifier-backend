import { Module } from '@nestjs/common';
import { LineController } from './line.controller';

@Module({
  controllers: [LineController],
})
export class LineModule {}
