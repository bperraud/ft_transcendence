import {
  Controller,
  Patch,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { StatService } from './stat.service';
import { UpdateStatDto } from './dto';

@UseGuards(JwtGuard)
@Controller('stat')
export class StatController {
  constructor(private statService: StatService) {}

  @Patch('update-stats')
  updateStats(@GetUser('id') userId: number, @Body() dto: UpdateStatDto) {
    return this.statService.updateStat(userId, dto);
  }

  @Get('get-history/:id')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.statService.getHistory(id);
  }

  @Get('get-stat/:id')
  getStat(@Param('id', ParseIntPipe) id: number) {
    return this.statService.getStat(id);
  }
}
