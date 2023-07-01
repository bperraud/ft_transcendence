import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { UseGuards } from '@nestjs/common';
import { StatService } from './stat.service';

@UseGuards(JwtGuard)
@Controller('stat')
export class StatController {
  constructor(private statService: StatService) {}

  @Get('get-history/:id')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.statService.getHistory(id);
  }

  @Get('get-stat/:id')
  getStat(@Param('id', ParseIntPipe) id: number) {
    return this.statService.getStat(id);
  }
}
