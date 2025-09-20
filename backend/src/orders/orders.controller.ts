import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { PackOrdersDto } from './dto/pack-orders.dto';
import { PackingService } from './packing.service';

@ApiTags('orders')
@ApiSecurity('api-key')
@UseGuards(ApiKeyGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly packingService: PackingService) {}

  @Post('pack')
  @ApiBody({ type: PackOrdersDto })
  pack(@Body() body: PackOrdersDto) {
    return this.packingService.pack(body);
  }
}
