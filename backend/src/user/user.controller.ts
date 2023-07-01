import {
  Body,
  Controller,
  Patch,
  UseGuards,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  NotFoundException,
  Get,
  Param,
  StreamableFile,
  ParseIntPipe,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaClient } from '@prisma/client';
import { createReadStream } from 'fs';
import { join } from 'path';
import * as fs from 'fs';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService, private prisma: PrismaClient) {}

  @Get('me')
  getMe(@GetUser('id') userId: number) {
    const user = this.prisma.user.findUnique({ where: { id: userId } });
    return user;
  }

  @Get('info/:id')
  getInfo(@Param('id', ParseIntPipe) id: number) {
    return this.prisma.user.findUnique({ where: { id: id } });
  }

  @Get('info/name/:username')
  getInfoByName(@Param('username') username: string) {
    return this.prisma.user.findUnique({ where: { username: username } });
  }

  @Get('avatar/:id')
  @UseInterceptors()
  async getUserPhoto(@Param('id') id: string) {
    const path = join(process.cwd(), '/upload', `${id}.png`);
    if (!fs.existsSync(path)) {
      throw new NotFoundException('Avatar not found');
    }
    const file = createReadStream(join(process.cwd(), '/upload', `${id}.png`));
    return new StreamableFile(file);
  }

  @Patch('edit')
  async editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  uploadFileAndPassValidation(
    @GetUser('id') id,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10000000 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.userService.saveImageFromBuffer(file, `${id}.png`);
  }

  @Get('me/blocks')
  getMyBlocks(@GetUser() user) {
    const blocks = this.userService.getUserBlocks(user.username);
    return blocks;
  }

  @Post('block')
  async blockUser(
    @Body('userId') userId: number,
    @Body('blockedId') blockedId: number,
  ) {
    const block = this.userService.blockUser(userId, blockedId);
    return block;
  }

  @Post('unblock')
  async unblockUser(
    @Body('userId') userId: number,
    @Body('blockedId') blockedId: number,
  ) {
    const block = this.userService.unblockUser(userId, blockedId);
    return block;
  }
}
