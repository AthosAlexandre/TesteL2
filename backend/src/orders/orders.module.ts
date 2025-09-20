import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Box } from '../boxes/box.entity';
import { OrdersController } from './orders.controller';
import { PackingService } from './packing.service';

@Module({
  imports: [TypeOrmModule.forFeature([Box])],
  controllers: [OrdersController],
  providers: [PackingService],
})
export class OrdersModule {}
