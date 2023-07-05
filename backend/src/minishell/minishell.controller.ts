import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('minishell')
export class MinishellController {
  private childProcess: any;

  @Post('start')
  startCProgram(): void {
    return;
  }

  @Post('write')
  writeInputToCProgram(@Body() inpute: string): Promise<string> {
    return;
  }
}
