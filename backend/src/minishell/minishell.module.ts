import { Module } from '@nestjs/common';
import { MinishellController } from './minishell.controller';
import { MinishellService } from './minishell.service';

@Module({
  controllers: [MinishellController],
  providers: [MinishellService],
})
export class MinishellModule {}
